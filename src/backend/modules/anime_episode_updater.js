/**
 * Created by nathan on 5/13/14.
 */

/*jslint node: true*/
"use strict";

var AnimeTorrentSearcher = require('../resources/anime_torrent_searcher'),
    Episode = require('../models/episode'),
    Q = require('q');

var AnimeEpisodeUpdater = module.exports = function (anime, options) {
    this.anime = anime;
    this.options = options || {};
};

AnimeEpisodeUpdater.prototype = {
    getEpisodeOnDisk: function() {
        return Episode.findPromise({ anime: this.anime._id });
    },
    getTorrents: function() {
        var torrentSearch = new AnimeTorrentSearcher(this.anime);
        return torrentSearch.search();
    },
    getMissingEpisodes: function() {
        return Q.all([this.getEpisodeOnDisk(), this.getTorrents()])
            .then(this.compareMissingEpisodes);
    },
    compareMissingEpisodes: function(results) {
        var diskArray = getDiskEpisodeNumbers(results[0]);
        var torrentArray = setTorrentEpisodeNumbers(results[1]);
        var deferred = Q.defer();

        var missingEps = torrentArray.filter(function(e) {
            if (diskArray.indexOf(e.episodeNumber) === -1) {
                return true;
            }
        });

        deferred.resolve(missingEps);

        return deferred.promise;
    }
};

function getDiskEpisodeNumbers(disk) {
    return disk.map(function(e) { return e.number });
}

function setTorrentEpisodeNumbers(torrents) {
    return torrents.map(function(e) {
        var number = e.name.match(/\d{2}/i);
        console.log(number);
        if (number !== undefined) {
            var epNumber = parseInt(number.shift());
            if (epNumber < 32) {
                e.episodeNumber = epNumber
            }
        }
        return e;
    });
}

