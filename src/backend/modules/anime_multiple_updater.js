/*jslint node:true*/
"use strict";

var AnimeEpisodeUpdater = require("./anime_episode_updater"),
    Transmission = require('../models/transmission'),
    Q = require('q');

var AnimeMultipleUpdater = module.exports = function (anime, options) {
    this.anime = anime;
    this.options = options || { pushToServer: false };

    /**
     * Generates a single promise for a single anime
     * @param anime
     * @returns {Promise|*}
     * @private
     */
    var generatePromise = function generatePromise(anime) {
        var updater = new AnimeEpisodeUpdater(anime);
        return updater.getMissingEpisodes();
    };

    /**
     * Returns the promises of recently released torrents for anime
     * @returns {Promise|Array}
     * @protected
     */
    this.getPromises = function getPromises() {
        return Q.all(this.anime.map(generatePromise));
    };

};

AnimeMultipleUpdater.prototype = {
    /**
     * Returns a promise of the new torrents for assorted anime
     * @returns {Promise|Array}
     */
    update: function () {
        var deferred = Q.defer();
        if (this.options.pushToServer) {
            var transmission = new Transmission();
            this.getPromises().then(function (results) {
                if (results.every(function (e) {
                    return e.length === 0;
                })) {
                    deferred.resolve({ message: 'No new episodes found' });
                }
                var torrentLinks = results.filter(function (e) {
                    return e.length > 0;
                }).map(function (e) {
                    return e.map(function (j) {
                        return j.href;
                    });
                }).reduce(function (prev, curr) {
                    return prev.concat(curr);
                });
                var promise = Q.denodeify(transmission.addMultipleTorrents.bind(transmission));
                return promise(torrentLinks);
            }).then(function (results) {
                return deferred.resolve(results);
            }, function (err) {
                return deferred.reject(err);
            });
        } else {
            this.getPromises()
                .then(function (results) {
                    deferred.resolve(results.reduce(function (prev, curr) {
                        return prev.concat(curr);
                    }).map(function (e) {
                        e.status = 'static';
                        return e;
                    }));
                });
        }
        return deferred.promise;
    }
};
