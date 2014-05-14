/**
 * Created by nathan on 5/13/14.
 */

var Anime = require('../models/anime'),
    Episode = require('../models/episode'),
    Q = require('q');

var TorrentGetter = module.exports = function () {
};

/**
 * Return the promise of the anime that I am currently watching
 * @returns Promise
 */
TorrentGetter.prototype.getWatchingAnime = function () {
    var anime = Anime;
    return Q.denodeify(anime.find.bind(anime))({ is_watching: true });
};

TorrentGetter.prototype.getAnimePromise = function (searchParams) {
    var anime = Anime;
    return Q.denodeify(anime.find.bind(anime))(searchParams);
};

TorrentGetter.prototype.parseAnime = function () {
    var self = this,
        deferred = Q.defer();

    this.getWatchingAnime()
        .then(function (results) {
            return self.formatAnimeObj(results);
        })
        .spread(function () {
            var animeObjs = Array.prototype.slice.call(arguments);
            return animeObjs.map(self.getEpisodesByAnime);
        })
        .spread(function () {
            var episodes = Array.prototype.slice.call(arguments);
            return episodes.map(self.getLatestEpisode);
        })
        .then(function (results) {
            deferred.resolve(results);
        }).done();

    return deferred.promise;
};

/**
 * Formats the anime model object initially
 * @param result
 * @returns {*}
 */
TorrentGetter.prototype.formatAnimeObj = function (result) {
    return result.map(function (e) {
        return {
            id: e.id,
            title: e.title,
            subgroup: e.designated_subgroup
        };
    });
};

/**
 * Joins the anime and latest episode models together so we can finally form a query string for NyaaTorrents
 */
TorrentGetter.prototype.getSearchQueries = function () {
    var self = this;
    var episodeResults = [];
    self.parseAnime()
        .then(function (results) {
            episodeResults = results;
            return results.map(function (e) {
                return self.getAnimePromise({ _id: e.anime });
            });
        })
        .then(function (promises) {
            return Q.allSettled(promises);
        })
        .then(function (results) {
            var mergeResults = [];
            while (results.length !== 0) {
                mergeResults.push({
                    animeModel: results.shift().value[0],
                    latestEpModel: episodeResults.shift()
                });
            }
            return mergeResults;
        });
};

/**
 * Returns a promise of an anime's episodes
 * @param anime
 * @returns Promise
 */
TorrentGetter.prototype.getEpisodesByAnime = function (anime) {
    var ep = Episode;
    return Q.denodeify(ep.find.bind(ep))({ anime: anime.id });
};

/**
 * Gets the latest episode from an array of episodes
 * @param results
 * @returns Int
 */
TorrentGetter.prototype.getLatestEpisode = function (results) {
    return results.reduce(function (prev, pres) {
        if (prev.number < pres.number) {
            return pres;
        } else {
            return prev;
        }
    }, { number: 0 });
};

