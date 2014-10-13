/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true*/
"use strict";

var Transmission = require('../models/transmission'),
    TorrentHelper = require('../helpers/torrents'),
    SocketHandler = require('../modules/socket_handler'),
    NotificationMgr = require('../modules/notifications_manager'),
    Cache = require('../modules/cache'),
    TorrentSearcher = require('../resources/anime_torrent_searcher'),
    NyaaTorrents = require('nyaatorrents');

var Client = new Transmission(),
    NT = new NyaaTorrents();

/**
 * @constructor
 */
var TorrentController = module.exports = (function (Client, NT) {

    var RETRY_ATTEMPTS = 10;

    /**
     * Handle the errors from NyaaTorrents since we do get timeout issues. Thanks DDOS.
     * @param err
     * @param searchTerms
     * @param cb
     * @param attempts
     */
    var handleErr = function recur(err, searchTerms, cb, attempts) {
        attempts = attempts || 0;

        // We have a timeout issue here.
        if (err.code === 'ETIMEOUT' && attempts < RETRY_ATTEMPTS) {
            NT.search(searchTerms, function (err, results) {
                if (attempts < 3) err = { code: 'ETIMEOUT' };
                if (err) {
                    return recur(err, searchTerms, cb, ++attempts);
                } else {
                    return cb(null, results);
                }
            });
        } else {
            return cb(err, null);
        }
    };

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
                    NotificationMgr.emit('notification:new', {
                        type: 'note',
                        title: 'new ep!',
                        message: 'new ep!',
                        body: 'new ep'
                    });
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
            var searcher = new TorrentSearcher();
            searcher.search(search, function (err, results) {
                if (err) {
                    handleErr(err, { term: search }, function (err, results) {
                        console.log(results);
                    });
                } else {
                    res.send(results.filter(function (item) {
                        return item.categories.indexOf('english-translated-anime') > 0;
                    }).map(function (e) {
                        var tHelper = new TorrentHelper(e);
                        return tHelper.addNewAttributes();
                    }));
                }
            });
        },
    };
})(Client, NT);
