/*
 * GET home page.
 */

"use strict";
var anime = require('../models/anime');
var mal = require('../helpers/mal');
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
        var test = animeDirectory.collection.toJSON();
        res.send(test);
    });
};

exports.getapi = function(req, res) {
    var api = mal.MyAnimeListModule;
    api.search('strike witches', function(err, apiResponse) {
        if (!err) {
            res.send(apiResponse);
        }
    })
};