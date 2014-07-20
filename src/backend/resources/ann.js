/**
 * Created by nathanyam on 13/04/2014.
 */
/*jslint node: true*/
"use strict";

var Q = require('q'),
    FS = require('fs'),
    request = require('request');

var Parsers = require('./../helpers/api_parsers'),
    Anime = require('../models/anime'),
    AnimeAPI = require('./anime_api'),
    ANN_IMAGE_DIR = require('./../config').image_dir,
    ANN_GENERAL_URI = 'http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&type=anime',
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

var AnimeNewsNetwork = module.exports = function () {
    /**
     * General search instance variable that is run on general search entries, which may yield multiple results.
     * @type {AnimeAPI}
     */
    this.generalSearch = new AnimeAPI({
        url: ANN_GENERAL_URI,
        cache: {
            tag: 'ann'
        }
    });

    /**
     * Specific search instance variable that is run on specific search entries, which should yield a single result.
     * @type {AnimeAPI}
     */
    this.specificSearch = new AnimeAPI({
        url: ANN_SPECIFIC_URI
    }, parsers);
};

/**
 * Main accessor to search for anime on AnimeNewsNetwork. Relegates multiple results to their appropriate handlers.
 * @param query
 * @param done
 */
AnimeNewsNetwork.prototype.search = function (query, done) {
    var self = this;

    if (query.ann_id) {
        this.specificSearch.search({ anime: query.ann_id }, function (err, results) {
            self.setImage(results, done);
        });
    } else {
        if (query.name !== undefined) {
            this.generalSearch.search({ name: query.name }, function (err, results) {
                if (err) {
                    done(err, null);
                } else {
                    self.parseGeneralResults(results, done);
                }
            });
        } else {
            done(null, { result: "A name is required for a search."});
        }
    }
};

/**
 * Here we parse the results from the general search. It attempts to handle the different responses that you can get
 * from the Anime News Network API
 * @param results
 * @param done
 */
AnimeNewsNetwork.prototype.parseGeneralResults = function (results, done) {
    // are the results empty?
    var self = this;
    if (!isEmpty(results)) {
        // do we have multiple results?
        if (isMultipleResults(results)) {
            this.handleMultipleResults(results, done);
        } else {
            // finally, do we have the single result to parse?
            this.specificSearch.search({ anime: getResultId(results) }, function (err, result) {
                self.setImage(result, done);
            });
        }
    } else {
        // handle the empty response
        this.handleEmptyResponse(results, done);
    }
};

/**
 * We search the anime name on Google to get the actual ID from AnimeNewsNetwork if their internal search
 * fails
 * @param response
 * @param done
 */
AnimeNewsNetwork.prototype.handleEmptyResponse = function (response, done) {
    var self = this;
    var searchTerm = response.report.args[0].name[0],
        Google = require('./../helpers/google'),
        google = new Google();

    google.searchAnime(searchTerm, function (err, result) {
        // Get valid results from the google search by parsing the URL
        var validResults = result.items.filter(function (e) {
            return e.link.indexOf('anime.php?id') !== -1;
        });
        var firstResult = validResults[0],
            annLink = firstResult.link;

        // lol this is terrible
        var id = require('url').parse(annLink).query.split('=').pop();
        self.specificSearch.search({ anime: id }, function (err, result) {
            self.setImage(result, done);
        });
    });
};

/**
 * Formats multiple result responses
 * @param response
 * @param done
 */
AnimeNewsNetwork.prototype.handleMultipleResults = function (response, done) {
    var results = response.report.item,
        formattedResults = results.map(function (e) {
            return {
                ann_id: e.id[0],
                title: e.name[0],
                type: e.type[0]
            };
        });
    done(null, formattedResults);
};

/**
 * Gets the largest image from ANN and downloads it does not exist in the image media directory. An subsequent requests
 * for this image will use the image that hosted on the application server, not ANN CDN so we don't needlessly hammer
 * their servers for our requests.
 *
 * @param result Result from the AnimeNewsNetwork API call
 * @param cb Callback called when the image has been saved to the image media directory
 */
AnimeNewsNetwork.prototype.setImage = function (result, cb) {
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
            result.images = ['http://localhost:3000/media/images/' + localImageFileName];
            cb(null, result);
        } else {
            downloadImage(imageUrl, ANN_IMAGE_DIR + '/' + localImageFileName)
                .then(function () {
                    delete result.images;
                    result.images = ['http://localhost:3000/media/images/' + localImageFileName];
                    cb(null, result);
                }
            );
        }

        // If it does not, we save it to the hard drive
    }, function (err) {
        // We still want to proceed with the process, so don't stop it here
        console.log(err);
    });
};

function getFullImage(images) {
    return images.filter(function (e) {
        return e.indexOf('full') !== -1 || e.indexOf('max') !== -1;
    }).pop();
}

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
 * TODO: Ensure we get rid of stupid non-letter characters. Anime has such weird names.
 * @param animeName The anime name
 * @param fileName The basename of the image that will be saved
 * @returns {string}
 */
function formatImageFileName(animeName, fileName) {
    var fileType = fileName.split('.').pop();
    animeName = animeName.toLowerCase().replace(' ', '');
    return 'ann_' + animeName + '_full.' + fileType;
}

var isEmpty = function (result) {
    var noResult = false;
    // Is this an anime ID result?
    if (result.report.item === undefined) {
        noResult = true;
    }
    return noResult;
};

var isMultipleResults = function (results) {
    return results.report.item !== undefined && results.report.item.length > 1;
};

function getResultId(results) {
    return parseInt(results.report.item[0].id[0]);
}
