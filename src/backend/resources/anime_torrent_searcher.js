/**
 * Search for torrents given an anime model in the constructor
 */
/*jslint node: true */
"use strict";

var Q = require('q'),
    NTWrapper = require('./nyaatorrents_wrapper');

var AnimeTorrentSearcher = module.exports = function(anime, options) {
    this.anime = anime;
    this.options = options || {};
};

AnimeTorrentSearcher.prototype = {
    // Search the torrents for an anime
    search: function() {
        var nt = new NTWrapper(),
            searchTerms = formSearchString(this.anime.designated_subgroup, this.anime.title);

        return Q.denodeify(nt.search.bind(nt))({ terms: searchTerms });
    }
};

// PRIVATE METHODS

function formSearchString(subGroup, title) {
    return '[' + subGroup + '] ' + title;
}
