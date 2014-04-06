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
    var name = req.query.name;
    Anime.find({title: name}, function (err, animes) {
        res.send(animes);
    });
};

// get one anime by ID

