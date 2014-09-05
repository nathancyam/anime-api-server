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
    this.anime = anime;
    this.searchRepository = null;
    this.options = options || {};

    var nt = new NT();
    var tt = new TT.Client('www.tokyotosho.info', 80, '/');

    this._search = function () {
        var self = this;
        var deferred = Q.defer();
        var searchTerms = formSearchString(this.anime.designated_subgroup, this.anime.title);

        this._nyaaTorrentSearch(searchTerms)
            .then(function (results) {
                return deferred.resolve(results);
            }, function () {
                self._ttSearch(searchTerms)
                    .then(function (results) {
                        return deferred.resolve(results);
                    }
                );
            });

        return deferred.promise;
    };

    this._nyaaTorrentSearch = function (searchTerms) {
        var deferred = Q.defer();
        nt.search({term: searchTerms}, function (err, result) {
            if (err) {
                deferred.reject(err);
            } else {
                if (Array.isArray(result)) {
                    deferred.resolve(result.map(function (e) {
                        var tHelper = new TorrentHelper(e);
                        return tHelper.addNewAttributes();
                    }));
                } else {
                    deferred.reject({ message: 'Results must be an array' });
                }
            }
        });

        return deferred.promise;
    };

    this._ttSearch = function (searchTerms) {
        var deferred = Q.defer();
        tt.search({term: searchTerms}, function (err, result) {
            if (err) {
                deferred.reject(err);
            } else {
                if (Array.isArray(result)) {
                    deferred.resolve(result.map(function (e) {
                        var tHelper = new TorrentHelper(e);
                        return tHelper.addNewAttributes();
                    }));
                } else {
                    deferred.reject({ message: 'Results must be an array' });
                }
            }
        });

        return deferred.promise;
    };
};

AnimeTorrentSearcher.prototype = {
    // Search the torrents for an anime
    search: function () {
        return this._search();
    }
};

// PRIVATE METHODS

function formSearchString(subGroup, title) {
    return '[' + subGroup + '] ' + title;
}
