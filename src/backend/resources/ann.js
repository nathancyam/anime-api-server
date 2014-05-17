/**
 * Created by nathanyam on 13/04/2014.
 */
/*jslint node: true*/
"use strict";

var Parsers = require('./../helpers/api_parsers'),
    Anime = require('../models/anime'),
    AnimeAPI = require('./anime_api'),
    ANN_GENERAL_URI = 'http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&type=anime',
    ANN_SPECIFIC_URI = 'http://cdn.animenewsnetwork.com/encyclopedia/api.xml';


var parsers = [
    function () {
        Parsers.dollarParser('src', 'images')(this);
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
    this.generalSearch = new AnimeAPI({
        url: ANN_GENERAL_URI,
        cache: {
            tag: 'ann'
        }
    });
    this.specificSearch = new AnimeAPI({
        url: ANN_SPECIFIC_URI
    }, parsers);
};

AnimeNewsNetwork.prototype.search = function (query, done) {
    var self = this;
    if (query.ann_id) {
        this.specificSearch.search({ anime: query.ann_id }, done);
    } else {
        if (query.name !== undefined) {
            this.generalSearch.search({ name: query.name }, function (err, results) {
                if (err) throw Error(err.message);
                self.parseGeneralResults(results, done);
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
    if (!isEmpty(results)) {
        // do we have multiple results?
        if (isMultipleResults(results)) {
            this.handleMultipleResults(results, done);
        } else {
            // finally, do we have the single result to parse?
            this.specificSearch.search({ anime: getResultId(results) }, done);
        }
    } else {
        // handle the empty response
        this.handleEmptyResponse(results, done);
    }
};

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
        self.specificSearch.search({ anime: id }, done);
    });
};

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

function getANNID(result) {
    return parseInt(result.ann.anime[0].$.id);
}
