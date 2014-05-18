/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true*/
"use strict";

var Transmission = require('../models/transmission'),
    AnimeEpisodeUpdater = require('../modules/anime_episode_updater'),
    NyaaTorrents = require('nyaatorrents');

var Client = new Transmission({
        host: 'local.rpi',
        port: 9091
    }),
    NT = new NyaaTorrents();

exports.addTorrent = function (req, res) {
    Client.add(req.body.torrentUrl, function (err, result) {
        res.send(result);
    });
};

exports.search = function (req, res) {
    var search = req.query.name;
    NT.search({ term: search }, function (err, results) {
        res.send(results.filter(function (item) {
            return item.categories.indexOf('english-translated-anime') > 0;
        }).map(function (item) {
            item.readableSize = bytesToSize(item.size);
            return item;
        }));
    });
};

exports.test = function (req, res) {
    var Anime = require('../models/anime');
    Anime.findOne({is_watching:true}, function(err, result) {
        var update = new AnimeEpisodeUpdater(result);
        update.getMissingEpisodes().then(function(result) {
            res.send(result);
        });
    });
};

function bytesToSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    return Math.round(bytes / Math.pow(1024, 2), 2) + ' MB';
}
