/**
 * Search for torrents given an anime model in the constructor
 */
/*jslint node: true */
"use strict";

var Q = require('q'),
    NT = require('nyaatorrents'),
    TorrentHelper = require('../helpers/torrents');

/**
 * @constructor
 * @type {exports}
 */
var AnimeTorrentSearcher = module.exports = function (anime, options) {
    this.anime = anime;
    this.options = options || {};
};

AnimeTorrentSearcher.prototype = {
    // Search the torrents for an anime
    search: function () {
        var nt = new NT(),
            deferred = Q.defer(),
            searchTerms = formSearchString(this.anime.designated_subgroup, this.anime.title);

        nt.search({term: searchTerms}, function (err, result) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(result.map(function (e) {
                    var tHelper = new TorrentHelper(e);
                    return tHelper.addNewAttributes();
                }));
            }
        });

        return deferred.promise;
    }
};

// PRIVATE METHODS

function formSearchString(subGroup, title) {
    return '[' + subGroup + '] ' + title;
}
