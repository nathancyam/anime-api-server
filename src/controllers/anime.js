/**
 * Created by nathan on 4/6/14.
 */

var Anime = require('../models/anime');

// GET

// get a list of all the anime
exports.list = function (req, res) {
    Anime.find(function (err, results) {
        res.send(results);
    });
};

// get one anime by name
// TODO: Should this one redirect you to the ID one at some point?
exports.findByName = function (req, res) {
    var normalizedQueryName = req.params.name.replace(/\W/g, '').toLowerCase();
    Anime.find({normalizedName: normalizedQueryName}, function (err, animes) {
        res.send(animes);
    });
};

// get one anime by ID

exports.readAnimeDirectory = function (req, res) {
    Anime.readAnimeDirectory(function () {
        res.redirect('/anime');
    });
};

function createEpisodeModels(done) {
    var Episode = require('../models/episode');
    var async = require('async');
    async.waterfall([
        function (next) {
            Anime.find(function (err, result) {
                next(null, result);
            });
        },
        function (results, finished) {
            async.each(results, function (anime, cb) {
                async.each(anime.filenames, function (ep, epCb) {
                    var model = new Episode({
                        filePath: anime.filepath + '/' + ep,
                        isAnime: true,
                        anime: anime.id
                    });
                    model.save(function () {
                        epCb();
                    });
                }, function () {
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

exports.sync = function (req, res) {
    Anime.syncDb(function () {
        res.redirect('/anime');
    });
};

exports.createEps = function (req, res) {
    createEpisodeModels(function () {
        var Episode = require('../models/episode');
        Episode.find(function (err, results) {
            res.send(results);
        });
    });
};

