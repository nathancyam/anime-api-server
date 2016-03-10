/*jslint node:true*/
"use strict";

var AnimeEpisodeUpdater = require("./anime_episode_updater"),
    Transmission = require('../models/transmission'),
    NotificationMgr = require('./notifications_manager'),
    Q = require('q');

/**
 * @constructor
 * @type {exports}
 */
var AnimeMultipleUpdater = module.exports = function (anime, options) {
    this.anime = anime;
    this.options = options || { pushToServer: false };

    /**
     * Generates a single promise for a single anime
     *
     * @param anime
     * @returns {Promise|*}
     * @private
     */
    var _generatePromise = function _generatePromise(anime) {
        var updater = new AnimeEpisodeUpdater(anime);
        return updater.getMissingEpisodes();
    };

    /**
     * Returns a string of hyperlinks that should be added to the torrent
     * server.
     *
     * @param torrentLinks Array of torrent results
     * @returns {Array<String>}
     * @private
     */
    this._parseTorrentLinks = function (torrentLinks) {
        return torrentLinks.filter(function (e) {
            return e.length > 0;
        }).map(function (e) {
            return e.map(function (j) {
                return j.href;
            });
        }).reduce(function (prev, curr) {
            return prev.concat(curr);
        });
    };

    /**
     * Returns the promises of recently released torrents for anime
     *
     * @returns {Promise|Array}
     * @protected
     */
    this._getPromises = function getPromises() {
        return Q.all(this.anime.map(_generatePromise));
    };

    /**
     * Notifies that the torrents have been added to the torrent server.
     *
     * @param torrents
     * @private
     */
    this._notifyTorrentRetrevial = function (torrents) {
        var torrentsString = torrents.join(',', torrents);
        NotificationMgr.emit('notification:new', {
            type: 'NEW_EPISODE',
            title: 'New Episodes Received',
            message: 'New episodes received: ' + torrentsString
        });
    };
};

AnimeMultipleUpdater.prototype = {
    /**
     * Returns a promise of the new torrents for assorted anime
     * @returns {Promise|Array}
     */
    update: function () {
        var self = this;
        var deferred = Q.defer();

        if (this.options.pushToServer) {
            var transmission = new Transmission();
            this._getPromises().then(function (results) {
                if (results.every(function (e) { return !e || e.length === 0; })) {
                    return deferred.resolve({ message: 'No new episodes found' });
                }
                var torrentLinks = self._parseTorrentLinks(results);
                var promise = Q.denodeify(transmission.addMultipleTorrents.bind(transmission));
                return promise(torrentLinks);
            }).then(function (results) {
                self._notifyTorrentRetrevial(results);
                return deferred.resolve(results);
            }, function (err) {
                return deferred.reject(err);
            });
        } else {
            this._getPromises()
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
