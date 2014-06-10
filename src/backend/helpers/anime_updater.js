/**
 * Created by nathanyam on 25/05/2014.
 */

/*jslint node: true*/
"use strict";

var Anime = require('../models/anime'),
    AnimeUpdater = require('../modules/anime_multiple_updater'),
    Q = require('q');

var AnimeUpdaterHelper = module.exports = {
    updateAnimeCollection: function (pushToServer, callback) {
        var updateEpisodes = Q.denodeify(Anime.syncDb);
        var updater = null;
        updateEpisodes().then(function () {
            Anime.find({is_watching: true}, function (err, results) {
                if (pushToServer) {
                    updater = new AnimeUpdater(results, { pushToServer: true });
                } else {
                    updater = new AnimeUpdater(results);
                }
                updater.update().then(function (results) {
                    return callback(null, results);
                }, function (err) {
                    return callback(err, null);
                });
            });
        });
    }
};
