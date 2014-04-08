/**
 * Created by nathan on 4/7/14.
 */

var Episode = require('../models/episode'),
    Anime = require('../models/anime'),
    async = require('async');

var EpisodeHelper = (function () {
    return {
        createEpisodeModels: function (done) {
            async.waterfall([
                function (next) {
                    Anime.find(function (err, result) {
                        next(null, result);
                    });
                },
                function (results, finished) {
                    async.each(results, function (anime, cb) {
                        var saveEpisodeIterator = function (ep, next) {
                            var model = new Episode({
                                filePath: anime.filepath + '/' + ep,
                                isAnime: true,
                                anime: anime.id
                            });
                            var epNumber = model.getEpisodeNumber();
                            if (epNumber !== null) model.number = epNumber;
                            model.save(function () {
                                next();
                            });
                        };
                        async.each(anime.filenames, saveEpisodeIterator, function () {
                            cb();
                        });
                    }, function () {
                        finished(null);
                    });
                }
            ], function (err, results) {
                done();
            });
        }
    }
})();

module.exports = EpisodeHelper;

