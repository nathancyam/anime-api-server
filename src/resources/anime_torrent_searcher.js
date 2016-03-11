/**
 * Search for torrents given an anime model in the constructor
 */
/*jslint node: true */
"use strict";

var Q = require('q');

var NT = require('nyaatorrents');

/**
 * Searches a torrent resource such as NyaaTorrents for anime.
 *
 * @constructor
 * @type {exports}
 */
var AnimeTorrentSearcher = module.exports = function (anime, options) {
    this.anime = anime || {};
    this.options = options || {};

    var nt = new NT();

    /**
     * Returns an array of torrent objects from tne NyaaTorrents library.
     * Only successful response are parsed.
     *
     * @param responses Array of responses from the torrent resource
     * @returns {*}
     * @private
     */
    var _getSuccessfulResponses = function (responses) {
        var successResponse = responses.filter(function (e) {
            return e.state === 'fulfilled';
        }).pop();
        return successResponse.value;
    };

    /**
     * Returns a string formed from the anime object to be used as the
     * search term.
     *
     * @param subGroup Subgroup of an anime
     * @param title Title of an anime
     * @returns {string}
     * @private
     */
    var _formSearchString = function _formSearchString(subGroup, title) {
        return '[' + subGroup + '] ' + title;
    };

    /**
     * Returns a promise for the results of the torrent search (i.e. NyaaTorrents).
     *
     * @param searchTerms Search terms to be used to search the torrent resource
     * @returns {Promise.<Array>}
     * @private
     */
    this._search = function (searchTerms) {
        var deferred = Q.defer();
        searchTerms = searchTerms || _formSearchString(this.anime.designated_subgroup, this.anime.title);

        var promiseNt = Q.denodeify(nt.search.bind(nt));

        Q.allSettled([
            promiseNt({ term: searchTerms }),
        ]).spread(function (ntRes) {
            // Check if the requests for these torrent sites failed.

            if (ntRes.state === 'rejected') {
                return deferred.reject({ status: 'ERROR', message: 'Failed to get anime from resources'});
            }
            return deferred.resolve(_getSuccessfulResponses([ntRes]));
        });

        return deferred.promise;
    };
};

AnimeTorrentSearcher.prototype = {
    /**
     * Returns a promise for the results of an anime.
     *
     * @param terms
     * @returns {Promise.<Array>}
     */
    search: function (terms) {
        return this._search(terms)
    }
};
