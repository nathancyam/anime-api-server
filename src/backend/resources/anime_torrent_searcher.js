/**
 * Search for torrents given an anime model in the constructor
 */
/*jslint node: true */
"use strict";

var Q = require('q'),
    NT = require('nyaatorrents'),
    TT = require('tokyotosho'),
    TorrentHelper = require('../helpers/torrents');

/**
 * @constructor
 * @type {exports}
 */
var AnimeTorrentSearcher = module.exports = function (anime, options) {
    this.anime = anime || {};
    this.options = options || {};

    var nt = new NT();
    var tt = new TT.Client('tokyotosho.info', 80, '/');

    var _getSuccessfulResponses = function (responses) {
        return responses.filter(function (e) {
            return e.state === 'fulfilled';
        }).pop();
    };

    this._search = function (searchTerms) {
        var deferred = Q.defer();
        searchTerms = searchTerms || formSearchString(this.anime.designated_subgroup, this.anime.title);

        var promiseNt = Q.denodeify(nt.search.bind(nt));

        Q.allSettled([
            promiseNt({ term: searchTerms }),
        ]).spread(function (ntRes, ttRes) {
            // Check if the requests for these torrent sites failed
            if (ntRes.state === 'rejected' && ttRes.state === 'rejected') {
                return deferred.reject({ status: 'ERROR', message: 'Failed to get anime from resources'});
            }
            return deferred.resolve(_getSuccessfulResponses([ntRes, ttRes]));
        });

        return deferred.promise;
    };
};

AnimeTorrentSearcher.prototype = {
    // Search the torrents for an anime
    search: function (terms, cb) {
        this._search(terms).then(function (results) {
            return cb(null, results);
        }, function (err) {
            return cb(err, null);
        });
    }
};

// PRIVATE METHODS

function formSearchString(subGroup, title) {
    return '[' + subGroup + '] ' + title;
}
