/*jslint node:true*/
"use strict";

var AnimeEpisodeUpdater = require("./anime_episode_updater"),
    Q = require('q');

var AnimeMultipleUpdater = module.exports = function (anime) {
    this.anime = anime;
};

AnimeMultipleUpdater.prototype = {
    getPromises: function () {
        return Q.all(this.anime.map(this.generatePromise));
    },
    generatePromise: function (anime) {
        var updater = new AnimeEpisodeUpdater(anime);
        return updater.getMissingEpisodes();
    }
};
