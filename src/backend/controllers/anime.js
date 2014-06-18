/**
 * Created by nathan on 4/6/14.
 */
/*jslint node: true */
"use strict";
var Anime = require('../models/anime'),
    Cache = require('../modules/cache'),
    AnimeUpdaterHelper = require('../helpers/anime_updater'),
    Q = require('q'),
    _ = require('lodash');

/**
 * Gets a list of all the anime model stored on the DB.
 * Sets a cached response
 * @param req
 * @param res
 */
exports.list = function (req, res) {
    Anime.find(function (err, results) {
        res.send(results);
    });
};

/**
 * Search for an anime
 * @param req
 * @param res
 */
exports.search = function (req, res) {
    Anime.find(req.query, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
};

/**
 * Search for an anime by ID
 * @param req
 * @param res
 */
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
        Cache.set(req.url, animes);
        res.send(animes);
    });
};

/**
 * Clears the DB of the anime collection and rebuilds them from the file system
 * @param req
 * @param res
 */
exports.sync = function (req, res) {
    Anime.syncDb(function (err, result) {
        if (err) console.log(err);
        res.json(result);
    });
};

exports.createEps = function (req, res) {
    var helper = require('./episode');
    helper.createEpisodeModels(function () {
        var Episode = require('./episode');
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
            // Add a check to stop pointless saves
            if (!_.isEqual(body, result)) {
                result = _.extend(result, body);
                result.save(function (err, dbResult) {
                    if (err) console.log(err);
                    res.send(dbResult);
                });
            } else {
                res.send({ message: "No changes made. Not saving" });
            }
        });
    }
};

/**
 * Gets a list of the latest episodes that we are currently watching
 * @param req
 * @param res
 */
exports.update = function (req, res) {
    var isUpdatingServer = false;
    console.log('Got request to update');
    if (req.query.push) {
        isUpdatingServer = true;
    }
    AnimeUpdaterHelper.updateAnimeCollection(isUpdatingServer, function (err, results) {
        if (err) {
            res.json(500, { status: 'ERROR', message: err.message });
        } else {
            res.send(results);
        }
    });
};

exports.updateConfig = function (req, res) {
    var config = req.body;
    Cache.set('animeUpdaterConfig', config);
    res.json({ status: 'SUCCESS', message: 'Configuration saved' });
};

exports.imageTest = function (req, res) {
    var anime = new Anime(),
        promise = Q.denodeify(anime.getPicture.bind(anime));

    var FS = require('fs');
    promise().then(function (result) {
        var promiseFS = Q.denodeify(FS.readFile);
        promiseFS(result).then(function () {
            res.sendfile(result);
        });
    });
};
