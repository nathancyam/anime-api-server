/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true*/
"use strict";

var Transmission = require('../models/transmission'),
    TorrentHelper = require('../helpers/torrents'),
    Cache = require('../modules/cache'),
    NyaaTorrents = require('nyaatorrents');

var Client = new Transmission(),
    NT = new NyaaTorrents();

/**
 * Adds a torrent to the torrent server
 * @param req
 * @param res
 */
exports.addTorrent = function (req, res) {
    Client.add(req.body.torrentUrl, function (err, result) {
        if (err) {
            res.send(500, { error: 'Could not add torrents', message: err });
        } else {
            res.send(result);
        }
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

exports.startProcess = function (req, res) {
    var time = Cache.get('animeUpdaterConfig');

    if (!time) {
        return res.json({ status: 'ERROR', message: 'No time assigned' });
    }

    var interval = time.timeInterval,
        number = parseInt(time.timeValue),
        multipler = 0;

    switch(interval) {
        case 'mins':
            multipler = 60000;
            break;
        case 'hours':
            multipler = 60000 * 60;
            break;
        default:
            break;
    }

    var timeInterval = parseInt(multipler * number);

    var spawn = require('child_process').spawn;
    spawn('node', [__dirname + '/../modules/anime_updater_process_handler.js', timeInterval]);
    res.json({ status: 'SUCCESS', message: 'Process started successfully' });
};
