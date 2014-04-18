/**
 * Created by nathanyam on 13/04/2014.
 */

"use strict";

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
    function() {
        dollarParser('src','images')(this);
    },
    function() {
        underscoreParser('Genres')(this);
    },
    function() {
        underscoreParser('Themes')(this);
    },
    function() {
        underscoreParser('Number of episodes')(this);
    },
    function() {
        underscoreParser('Plot Summary')(this);
    }
];

var AnimeNewsNetwork = require('./anime_api')(options);

var getResultId = function (results) {
    return parseInt(results.report.item.pop().id.pop());
};

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
    apiRequest.search(options, done);
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

function dollarParser (key, attribute) {
    return function(info) {
        var animeInfo = info.ann.anime[0].info[0],
            animeInfoArray = [];

        function recur() {
            Object.keys(animeInfo).map(function(element) {
                if (animeInfo[element].length !== undefined) {
                    animeInfo[element].filter(function(arrayElement) {
                        return arrayElement.$[key] !== undefined;
                    }).forEach(function(e) {
                        animeInfoArray.push(e.$[key]);
                    });
                }
                if (element === '$') {
                    if (animeInfo[element][key] !== undefined) {
                        animeInfoArray.push(animeInfo[element][key]);
                    }
                }
            });
        }
        recur();

        info[attribute] = animeInfoArray;
    };
}

function underscoreParser(type) {
    return function(data) {
        var animeInfo = data.ann.anime[0].info;
        data[type.toLowerCase().replace(/\s/g, '_')] = animeInfo.reduce(function(prev, curr) {
            if (curr.$.type !== undefined && curr.$.type === type) {
                prev.push(curr._);
            }
            return prev;
        }, []);
    }
}

module.exports = AnimeNewsNetwork;
