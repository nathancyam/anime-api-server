/**
 * Created by nathanyam on 13/04/2014.
 */
/*jslint node: true*/
"use strict";

var Q = require('q'),
    FS = require('fs'),
    request = require('request');

var Parsers = require('./../helpers/api_parsers'),
    AnimeAPI = require('./anime_api');

var ANN_IMAGE_DIR = require('./../config').image_dir,
    ANN_GENERAL_URI = 'http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&type=anime',
    ANN_ALL_ANIME = 'http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist=all&type=anime',
    ANN_SPECIFIC_URI = 'http://cdn.animenewsnetwork.com/encyclopedia/api.xml';


var parsers = [
    function () {
        Parsers.dollarParser('src', 'images')(this);
    },
    function () {
        Parsers.underscoreParser('Main title')(this);
    },
    function () {
        Parsers.underscoreParser('Genres')(this);
    },
    function () {
        Parsers.underscoreParser('Themes')(this);
    },
    function () {
        Parsers.numberOfEpisodeParser(this);
    },
    function () {
        Parsers.underscoreParser('Plot Summary')(this);
    },
    function () {
        Parsers.voiceActParser(this);
    },
    function () {
        Parsers.underscoreParser('Opening Theme')(this);
    },
    function () {
        Parsers.underscoreParser('Ending Theme')(this);
    }
];

/**
 * @constructor
 * @type {exports}
 */
var AnimeNewsNetwork = module.exports = function (googleHelper) {
    /**
     * General search instance variable that is run on general search entries, which may yield multiple results.
     * @type {AnimeAPI}
     */
    var generalSearch = new AnimeAPI({
        url: ANN_GENERAL_URI,
        cache: {
            tag: 'ann'
        }
    });

    /**
     * Specific search instance variable that is run on specific search entries, which should yield a single result.
     * @type {AnimeAPI}
     */
    var specificSearch = new AnimeAPI({
        url: ANN_SPECIFIC_URI
    }, parsers);

    var allSearch = new AnimeAPI({ url: ANN_ALL_ANIME });

    this.promiseGeneralSearch = Q.denodeify(generalSearch.search.bind(generalSearch));
    this.promiseSpecificSearch = Q.denodeify(specificSearch.search.bind(specificSearch));
    this.promiseAllSearch = Q.denodeify(allSearch.search.bind(allSearch));
    this.google = googleHelper;
};

AnimeNewsNetwork.prototype = {
    /**
     * Main accessor to search for anime on AnimeNewsNetwork. Relegates multiple results to their appropriate handlers.
     *
     * @param query
     * @param done
     */
    search: function (query, done) {
        var self = this;

        if (query.ann_id) {
            return self.specificSearchQuery(query);
        } else if (query.name !== undefined) {
            return self.generalSearchQuery(query);
        } else {
            done(null, { result: "A name is required for a search."});
        }
    },
    /**
     * Searches the anime given an ANN ID
     *
     * @param {Object} query
     * @returns {Promise|*} Results from ANN
     */
    specificSearchQuery: function (query) {
        var promiseSetImage = Q.denodeify(this.setImage.bind(this));
        return this.promiseSpecificSearch({ anime: query.ann_id })
            .then(function (result) {
                return promiseSetImage(result);
            }
        );
    },
    /**
     * General anime name search query to AnimeNewsNetwork
     *
     * Takes a query object that contains the AnimeNetworkNetwork ID or the anime name to search
     *
     * @param {Object} query
     * @returns {Promise|*} Results from ANN
     */
    generalSearchQuery: function (query) {
        var self = this;
        return this.promiseGeneralSearch({ name: query.name })
          .then(results => this.handleGeneralSearchResults(results))
          .then(result => {
              // If we have an object -> Promise to be fulfilled
              //               number -> ANN ID
              //               array  -> Multiple ANN IDs
              if (typeof result === 'object' && !Array.isArray(result)) {
                  return result.then(function (annId) {
                      query.ann_id = annId;
                      return self.specificSearchQuery(query);
                  });
              } else if (typeof result === 'number') {
                  query.ann_id = result;
              } else if (Array.isArray(result)) {
                  query.ann_id = result.pop().ann_id;
              }
              return self.specificSearchQuery(query);
          });
    },
    /**
     * Parse the results from the general search.
     *
     * It attempts to handle the different responses that you can get from the Anime News Network API
     *
     * @param {Object} response Results from a general name term search from the AnimeNewsNetwork API
     * @return {Promise} A promise for the AnimeNetworkNetwork ID
     */
    handleGeneralSearchResults: function (response) {
        // are the results empty?
        if (!isEmpty(response)) {
            // do we have multiple results?
            if (isMultipleResults(response)) {
                return Promise.resolve(this.handleMultipleResults(response));
            }
            // finally, do we have the single result to parse?
            return Promise.resolve(getResultId(response));
        }
        // handle the empty response
        return this.googleANN(response);
    },
    /**
     * Returns the AnimeNewsNetwork ID by searching the anime name on Google.
     *
     * @param {Object} response
     * @return {Promise|Number} Promise to get the AnimeNewsNetwork ID
     */
    googleANN: function (response) {
        var searchTerm = response.report.args[0].name[0];

        return this.google.searchAnime(searchTerm)
          .then(result => {
            // Get valid results from the google search by parsing the URL
            var validResults = result.items.filter(function (e) {
                return e.link.indexOf('anime.php?id') !== -1;
            });
            var firstResult = validResults[0],
                annLink = firstResult.link;

            // lol this is terrible
            return require('url').parse(annLink).query.split('=').pop();
          });
    },
    /**
     * Formats multiple result responses
     *
     * @param {Object} response
     * @return Array
     */
    handleMultipleResults: function (response) {
        var results = response.report.item;
        return results.map(function (e) {
            return {
                ann_id: e.id[0],
                title: e.name[0],
                type: e.type[0]
            };
        });
    },
    /**
     * Gets the largest image from ANN and downloads it does not exist in the image media directory. An subsequent requests
     * for this image will use the image that hosted on the application server, not ANN CDN so we don't needlessly hammer
     * their servers for our requests.
     *
     * @param {Object} result Result from the AnimeNewsNetwork API call
     * @param {Function} cb Callback called when the image has been saved to the image media directory
     */
    setImage: function (result, cb) {
        // Check if the image already exists on the hard drive. Since hard drive checks are slow, we may want to cache
        // the result somewhere else.
        var imageUrl = getFullImage(result.images);
        var readDir = Q.denodeify(FS.readdir);
        var localImageFileName = formatImageFileName(result.main_title[0], imageUrl);

        readDir(ANN_IMAGE_DIR).then(function (files) {
            var hasImage = files.some(function (e) {
                return e === localImageFileName;
            });

            // If it does, we use it instead of the image provided by Anime News Network
            // We override the image array from the ANN response
            if (hasImage) {
                delete result.images;
                result.images = ['/media/images/' + localImageFileName];
                cb(null, result);
            } else {
                downloadImage(imageUrl, ANN_IMAGE_DIR + '/' + localImageFileName)
                    .then(function () {
                        delete result.images;
                        result.images = ['/media/images/' + localImageFileName];
                        cb(null, result);
                    }
                );
            }
            // If it does not, we save it to the hard drive
        }, function (err) {
            // We still want to proceed with the process, so don't stop it here
            console.log(err);
        });
    },
    /**
     * Returns the entire listing of anime and saves it to the cache. This request does take a while to finish.
     */
    getAnimeListing: function () {
        var self = this;
        return self.promiseAllSearch();
    }
};

/**
 * Gets the largest image's URL from an array of image URL that is provided by ANN CDN.
 * @param images Images from ANN's CDN
 * @returns String
 */
function getFullImage(images) {
    return images.filter(function (e) {
        return e.indexOf('full') !== -1 || e.indexOf('max') !== -1;
    }).pop();
}

/**
 * Downloads an image from the URL to the file path specified as parameters.
 * Returns a promise that is fulfilled when the download finished and is written to disk
 *
 * @param url Image URL to be downloaded
 * @param location The filepath that is downloaded to
 * @returns {exports.pending.promise|*|adapter.deferred.promise|defer.promise|promise|Q.defer.promise}
 */
function downloadImage(url, location) {
    var deferred = Q.defer();
    var picStream = FS.createWriteStream(location);

    picStream.on('close', function () {
        deferred.resolve();
    });

    request(url).pipe(picStream);
    return deferred.promise;
}

/**
 * Generates a filename for the images that will be saved onto the application server
 * @param animeName The anime name
 * @param fileName The basename of the image that will be saved
 * @returns {string}
 */
function formatImageFileName(animeName, fileName) {
    var fileType = fileName.split('.').pop();
    animeName = animeName.toLowerCase().replace(/(\s|\W)/g, '');
    return 'ann_' + animeName + '_full.' + fileType;
}

/**
 * Checks if the response from ANN is empty
 *
 * @param result
 * @returns {boolean}
 */
var isEmpty = function (result) {
    var noResult = false;
    // Is this an anime ID result?
    if (result.report.item === undefined) {
        noResult = true;
    }
    return noResult;
};

/**
 * Checks if the response from ANN contains multiple results
 *
 * @param results
 * @returns {boolean}
 */
var isMultipleResults = function (results) {
    return results.report.item !== undefined && results.report.item.length > 1;
};

/**
 * Gets the ANN ID from the ANN response
 *
 * @param results
 * @returns {*}
 */
function getResultId(results) {
    return parseInt(results.report.item[0].id[0]);
}
