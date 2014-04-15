/**
 * Created by nathanyam on 12/04/2014.
 */

var Subgroup = require('../models/subgroup'),
    _ = require('underscore');

exports.list = function (req, res) {
    Subgroup.find(function (err, results) {
        res.json(results);
    });
};

exports.search = function(req, res) {
    var searchTerms = req.query;

    Object.keys(searchTerms).map(function(value) {
        searchTerms[value] = new RegExp(searchTerms[value], "i");
    });

    Subgroup.find(searchTerms, function (err, result) {
        if (err) console.log(err);
        res.json(result);
    });
};

exports.sync = function(req, res) {
    Subgroup.build(function(groups) {
        Subgroup.create(groups, function(err, result) {
            if (!err) {
                res.json({ status: 'success' });
            } else {
                res.json({ status: 'error', err: err });
            }
        });
    });
};
