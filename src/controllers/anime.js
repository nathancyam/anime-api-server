/**
 * Created by nathan on 4/6/14.
 */
"use strict";
var Anime = require('../models/anime'),
    Cache = require('../models/cache');

// GET

/**
 * Gets a list of all tne anime model stored on the DB.
 * Sets a cached response
 * @param req
 * @param res
 */
exports.list = function (req, res) {
    Anime.find(function (err, results) {
        Cache.set(req.url, results);
        res.send(results);
    });
};

exports.search = function (req, res) {
    Anime.find(req.query, function (err, result) {
        if (err) {
            console.log(err);
            return;
        } else {
            res.json(result);
        }
    });
};

exports.findById = function (req, res) {
    Anime.findOne({ _id: req.params.id }, function (err, result) {
        res.json(result);
    });
};

/**
 * Finds an anime on the DB by their name.
 * Sets a cached response.
 * @param req
 * @param res
 */
exports.findByName = function (req, res) {
    var normalizedQueryName = req.params.name.replace(/\W/g, '').toLowerCase();
    Anime.find({normalizedName: normalizedQueryName}, function (err, animes) {
        Cache.set(req.url, results);
        res.send(animes);
    });
};

/**
 * Clears the DB of the anime collection and rebuilds them from the file system
 * @param req
 * @param res
 */
exports.sync = function (req, res) {
    Anime.syncDb(function (err) {
        var result = {};
        if (err) {
            result.status = 'FAILED';
            result.message = err;
            console.log(err);
        } else {
            result.status = 'SUCCESS';
            result.message = 'SUCCESS';
        }
        setTimeout(function () {
            res.json(result);
        }, 5000);
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

exports.save = function (req, res) {
    var body = req.body;
    // If the anime's id has been specified, we can then save the anime
    if (body._id) {
        Anime.findById(body._id, function (err, result) {
            result.designated_subgroup = body.designated_subgroup;
            result.save(function (err, dbResult) {
                if (err) console.log(err);
                res.send(dbResult);
            });
        });
    }
};
