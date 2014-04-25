/**
 * Created by nathanyam on 13/04/2014.
 */

"use strict";

var Parsers = require('./api_parsers');
var options = {
    host: 'www.animenewsnetwork.com',
    path: '/encyclopedia/reports.xml?',
    query: {
        id: 155,
        type: 'anime'
    },
    search: {
        name: 'name'
    },
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

var AnimeNewsNetwork = module.exports = require('./anime_api')(options);

AnimeNewsNetwork.searchById = function (id, done) {
    var options = {
        host: 'cdn.animenewsnetwork.com',
        path: '/encyclopedia/api.xml?',
        query: {
            title: id
        },
        cache: {
            key: 'ann' + id,
            tag: 'ann'
        }
    };
    var apiRequest = require('./anime_api')(options, parsers);
    apiRequest.search(options, function (err, results) {
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
    return result.ann === undefined;
};

function getResultId (results) {
    return parseInt(results.report.item.pop().id.pop());
}
