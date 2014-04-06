/*
 * GET home page.
 */

"use strict";

exports.index = function (req, res) {
    res.render('index', { title: 'Express Cart App' });
};

exports.products = function (req, res) {
    res.render('product');
};

exports.gallery = function (req, res) {
    res.render('products');
};



