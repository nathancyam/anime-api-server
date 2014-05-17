/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true*/
"use strict";

var Transmission = require('../models/transmission'),
    SocketHandler = require('../modules/socket_handler'),
    TorrentGetter = require('../modules/torrent_getter'),
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
    var tg = new TorrentGetter(),
        promise = tg.getSearchResults();
    res.json('done...for now');
};

function bytesToSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    return Math.round(bytes / Math.pow(1024, 2), 2) + ' MB';
}
