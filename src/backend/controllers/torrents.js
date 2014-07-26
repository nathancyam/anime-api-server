/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true*/
"use strict";

var Transmission = require('../models/transmission'),
    TorrentHelper = require('../helpers/torrents'),
    SocketHandler = require('../modules/socket_handler'),
    Cache = require('../modules/cache'),
    NyaaTorrents = require('nyaatorrents');

var Client = new Transmission(),
    NT = new NyaaTorrents();

/**
 * @constructor
 */
var TorrentController = module.exports = (function (Client, NT) {
    return {
        /**
         * Adds a torrent to the torrent server
         * @param req
         * @param res
         */
        addTorrent: function (req, res) {
            Client.add(req.body.torrentUrl, function (err, result) {
                if (err) {
                    SocketHandler.emit('notification:error', { title: 'Torrent failed to add', message: err.message });
                    res.send(500, { error: 'Could not add torrents', message: err });
                } else {
                    SocketHandler.emit('notification:success', { title: 'Added torrent', message: 'Great Success' });
                    res.send(result);
                }
            });
        },
        /**
         * Searches for torrents that are english translated only from NyaaTorrents
         * @param req
         * @param res
         */
        search: function (req, res) {
            var search = req.query.name;
            NT.search({ term: search }, function (err, results) {
                res.send(results.filter(function (item) {
                    return item.categories.indexOf('english-translated-anime') > 0;
                }).map(function (e) {
                    var tHelper = new TorrentHelper(e);
                    return tHelper.addNewAttributes();
                }));
            });
        }
    };
})(Client, NT);
