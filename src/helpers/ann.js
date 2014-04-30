/**
 * Created by nathanyam on 13/04/2014.
 */

"use strict";

var Parsers = require('./api_parsers'),
    Anime = require('../models/anime'),
    AnimeAPI = require('./anime_api');

var options = {
    url: 'http://www.animenewsnetwork.com/encyclopedia/reports/xml?id=155&type=anime',
    cache: {
        tag: 'ann'
    }
};

var parsers = [
    function () {
        Parsers.dollarParser('src','images')(this);
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

var AnimeNewsNetwork = module.exports = new AnimeAPI(options);

AnimeNewsNetwork.searchRouter = function (query, done) {
    if (query.ann_id) {
        this.searchById(query.ann_id, done);
    } else {
        if (query.name === undefined) {
            done(null, { result: "A name is required for a search."});
        } else {
            this.search({ name: query.name }, done);
        }
    }
};

AnimeNewsNetwork.searchById = function (id, done) {
    var self = this;
    var options = {
        url: 'http://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=' + id,
        cache: {
            key: 'ann' + id,
            tag: 'ann'
        }
    };
    var apiRequest = new AnimeAPI(options, parsers);
    apiRequest.on('api_request_complete', function (data) {
        var resultID = getANNID(data),
            animeName = self.getSearchName();

        var regexp = new RegExp(animeName, "i");
        Anime.findOne({ title: regexp }, function (err, result) {
            result.ann_id = resultID;
            result.save();
        });
    });
    apiRequest.search({ id: id }, function (err, results) {
        // Here we check if the results are empty
        done(null, results);
    });
};

AnimeNewsNetwork.hasOneResult = function (results, done) {
    if (results.report.item !== undefined && results.report.item.length == 1) {
        var id = getResultId(results);
        if (done) {
            this.searchById(id, done);
        } else {
            return true;
        }
    } else {
        done(null, results);
    }
};

AnimeNewsNetwork.handleEmptyResponse = function (response, done) {
    var self = this;
    var searchTerm = response.report.args[0].name[0],
        Google = require('./google'),
        google = new Google();

    google.searchAnime(searchTerm, function (err, result) {
        var validResults = result.items.filter(function(e) {
            return e.link.indexOf('anime.php?id') !== -1;
        });
        var firstResult = validResults[0],
            annLink = firstResult.link;

        // lol this is terrible
        var id = require('url').parse(annLink).query.split('=').pop();
        self.searchById(id, done);
    });
};

AnimeNewsNetwork.isEmpty = function (result) {
    var noResult = false;
    // Is this an anime ID result?
    if (result.ann === undefined) {
        // Is this a general API search?
        if (result.report.item[0] === undefined) {
            noResult = true;
        }
    }
    return noResult;
};

function getResultId (results) {
    return parseInt(results.report.item.pop().id.pop());
}

function getANNID(result) {
    return parseInt(result.ann.anime[0].$.id);
}
