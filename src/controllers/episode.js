/**
 * Created by nathan on 4/7/14.
 */

var Episode = require('../models/episode');

exports.list = function (req, res) {
    Episode.find(function (err, results) {
        res.send(results);
    });
};

exports.getEpisodesByAnime = function (req, res) {
    var animeId = req.params.id;
    Episode.find({ anime: animeId }, function (err, results) {
        res.send(results);
    });
};

exports.sync = function (req, res) {
    Episode.sync(function () {
        res.json({ success: true });
    });
};