/*
 * GET home page.
 */

var anime = require('../models/anime');
var async = require('async');
var q = require('q');

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
    var animeDirectory = anime.AnimeDirectoryFactory();
    console.log('Got request');

    animeDirectory.readPath().then(function() {
        "use strict";
        var test = animeDirectory.collection.toJSON();
        res.send(test);
    });
};