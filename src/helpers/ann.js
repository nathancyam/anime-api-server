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

var AnimeNewsNetwork = require('./anime_api')(options);

var getResultId = function(results) {
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
    var apiRequest = require('./anime_api')(options);
    apiRequest.search(options, done);
};

AnimeNewsNetwork.hasOneResult = function(results, done) {
    if (results.report.item.length == 1) {
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


module.exports = AnimeNewsNetwork;
