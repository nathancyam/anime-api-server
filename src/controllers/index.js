/*
 * GET home page.
 */

"use strict";
var AnimeDirectory = require('../models/anime_directory').AnimeDirectoryFactory;

exports.index = function (req, res) {
    res.render('index', { title: 'Express Cart App' });
};

exports.products = function (req, res) {
    res.render('product');
};

exports.gallery = function (req, res) {
    res.render('products');
};

exports.getanime = function (req, res) {
//    var animeDirectory = new AnimeDirectory();
//    console.log('Got request');
//
//    animeDirectory.readPath().then(function() {
//        console.log('finished');
//        res.send('Done');
//    });
    var Anime = require('../models/anime');
    new Anime({title: 'Blah'}).save();
    Anime.find(function (err, animes) {
        res.send(animes);
    });
};


