/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true*/
"use strict";

var Transmission = require('../models/transmission'),
    NyaaTorrents = require('nyaatorrents'),
    TorrentHelper = require('../helpers/torrents');

var Client = new Transmission(),
    NT = new NyaaTorrents();

/**
 * Adds a torrent to the torrent server
 * @param req
 * @param res
 */
exports.addTorrent = function (req, res) {
    Client.add(req.body.torrentUrl, function (err, result) {
        res.send(result);
    });
};

/**
 * Searches for torrents that are english translated only from NyaaTorrents
 * @param req
 * @param res
 */
exports.search = function (req, res) {
    var search = req.query.name;
    NT.search({ term: search }, function (err, results) {
        res.send(results.filter(function (item) {
            return item.categories.indexOf('english-translated-anime') > 0;
        }).map(function (e) {
            var tHelper = new TorrentHelper(e);
            return tHelper.addNewAttributes();
        }));
    });
};
