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

exports.sync = function (req, res) {
    Anime.syncDb(function () {
        res.redirect('/anime');
    });
};

exports.createEps = function (req, res) {
    var helper = require('../helpers/episode');
    helper.createEpisodeModels(function () {
        var Episode = require('../models/episode');
        Episode.find(function (err, results) {
            res.send(results);
        });
    });
};

