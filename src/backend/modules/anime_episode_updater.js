/**
 * Created by nathan on 5/13/14.
 */

/*jslint node: true*/
"use strict";

var AnimeTorrentSearcher = require('../resources/anime_torrent_searcher'),
    Episode = require('../models/episode'),
    EpisodeHelper = require('../helpers/episode'),
    Anime = require('../models/anime'),
    Q = require('q');

/**
 * @constructor
 * @type {exports}
 */
var AnimeEpisodeUpdater = module.exports = function (anime, options) {
    this.anime = anime;
    this.options = options || {};
};

AnimeEpisodeUpdater.prototype = {
    /**
     * Gets an array of episodes that we have on the disk
     * @returns {*}
     */
    getEpisodeOnDisk: function () {
        return Episode.findPromise({ anime: this.anime._id });
    },
    /**
     * Gets an array of torrents from NyaaTorrents
     * @returns {*}
     */
    getTorrents: function () {
        var torrentSearch = new AnimeTorrentSearcher(this.anime);
        return torrentSearch.search();
    },
    /**
     * Get the missing episodes
     * @returns {Promise|*}
     */
    getMissingEpisodes: function () {
        return Q.allSettled([this.getEpisodeOnDisk(), this.getTorrents()])
            .then(this.compareMissingEpisodes);
    },
    /**
     * Compares the torrent listing and the list of episodes on the harddrive
     * to determine which ones are missing
     * @param results
     * @returns {exports.pending.promise|*|adapter.deferred.promise|defer.promise|promise|Q.defer.promise}
     */
    compareMissingEpisodes: function (results) {
        var deferred = Q.defer();
        var diskArray = getDiskEpisodeNumbers(results[0].value);

        if (Array.isArray(results[1].value)) {
            var torrentArray = setTorrentEpisodeNumbers(results[1].value);
            deferred.resolve(torrentArray.filter(function (e) {
                if (e.episodeNumber && diskArray.indexOf(e.episodeNumber) === -1) {
                    return true;
                }
            }));
        } else {
            return deferred.reject(new Error("Could not find new episodes."));
        }

        return deferred.promise;
    }
};

function getDiskEpisodeNumbers(disk) {
    return disk.map(function (e) {
        return e.number;
    });
}

/**
 *
 * @param torrents
 * @returns {Array}
 */
function setTorrentEpisodeNumbers(torrents) {
    return torrents.map(function (e) {
        e.episodeNumber = EpisodeHelper.getEpisodeNumberByFileName(e.name);
        return e;
    });
}

