/**
 * Created by nathan on 4/7/14.
 */

var Episode = require('../models/episode'),
    Anime = require('../models/anime'),
    async = require('async'),
    fs = require('fs');

/**
 * @constructor
 */
var EpisodeHelper = module.exports = (function () {
    return {
        getEpisodeFilenames: function (animeModel, done) {
            fs.readdir(animeModel.filepath, function (err, files) {
                async.each(files, function (file, next) {
                    var episode = new Episode({
                        filePath: animeModel.filepath + '/' + file,
                        anime: animeModel.id
                    });
                    episode.isAnime = true;
                    episode.getEpisodeNumber();
                    episode.save(function () {
                        next(null);
                    });
                }, function () {
                    done(null);
                });
            });

        },
        createEpisodeModels: function (done) {
            var self = this;
            async.waterfall([
                function (next) {
                    Anime.find(function (err, result) {
                        next(null, result);
                    });
                },
                function (results, finished) {
                    async.each(results, function (anime, cb) {
                        self.getEpisodeFilenames(anime, function () {
                            cb();
                        });
                    }, function () {
                        finished(null);
                    });
                }
            ], function (err) {
                if (err) {
                    done(err, null);
                } else {
                    done(null, { status: 'SUCCESS' });
                }
            });
        },
        getEpisodeNumberByFileName: function (fileName) {
            var number = fileName.match(/\d{2}/i);
            if (number) {
                var epNumber = parseInt(number.shift());
                if (epNumber < 32) {
                    return epNumber;
                }
            } else {
                return null;
            }
        }
    };
})();
