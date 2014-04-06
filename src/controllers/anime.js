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

exports.rebuildAnimeCollection = function (req, res) {
    var AnimeDirectory = require('../models/anime_directory').AnimeDirectoryFactory;
    var animeDirectory = new AnimeDirectory();
    animeDirectory.readPath().then(function () {
        console.log('Finished rebuilding, redirecting...');
        res.redirect('/anime');
    });
};

exports.flushAnimeCollection = function (req, res) {
    var mongoose = require('mongoose');
    var willRebuild = req.query.rebuild;
    mongoose.connection.collections['animes'].drop(function (err) {
        if (willRebuild) {
            exports.rebuildAnimeCollection(req, res);
        } else {
            res.redirect('/');
        }
    })
};
