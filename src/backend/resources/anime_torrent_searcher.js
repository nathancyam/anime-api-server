/**
 * Search for torrents given an anime model in the constructor
 */
/*jslint node: true */
"use strict";

var Q = require('q'),
    NT = require('nyaatorrents');

var AnimeTorrentSearcher = module.exports = function(anime, options) {
    this.anime = anime;
    this.options = options || {};
};

AnimeTorrentSearcher.prototype = {
    // Search the torrents for an anime
    search: function() {
        var nt = new NT(),
            deferred = Q.defer(),
            searchTerms = formSearchString(this.anime.designated_subgroup, this.anime.title);

        nt.search({term:searchTerms}, function(err, result) {
            deferred.resolve(result);
        });

        return deferred.promise;
    }
};

// PRIVATE METHODS

function formSearchString(subGroup, title) {
    return '[' + subGroup + '] ' + title;
}
