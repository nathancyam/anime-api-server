/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true*/
"use strict";


var Transmission = require('../models/transmission'),
  TorrentHelper = require('../helpers/torrents'),
  SocketHandler = require('../modules/socket_handler'),
  NotificationMgr = require('../modules/notifications_manager'),
  TorrentSearcher = require('../resources/anime_torrent_searcher'),
  NyaaTorrents = require('nyaatorrents');

const Client = new Transmission();
const NT = new NyaaTorrents();
const RETRY_ATTEMPTS = 10;

/**
 * Handle the errors from NyaaTorrents since we do get timeout issues. Thanks DDOS.
 * @param err
 * @param searchTerms
 * @param cb
 * @param attempts
 */
const handleErr = function handleErr(err, searchTerms, cb, attempts) {
  attempts = attempts || 0;

  // We have a timeout issue here.
  if (err.code === 'ETIMEOUT' && attempts < RETRY_ATTEMPTS) {
    NT.search(searchTerms, function (err, results) {
      if (attempts < 3) err = { code: 'ETIMEOUT' };
      if (err) {
        return handleErr(err, searchTerms, cb, ++attempts);
      } else {
        return cb(null, results);
      }
    });
  } else {
    return cb(err, null);
  }
};

module.exports = {

  /**
   * Adds a torrent to the torrent server
   * @param req
   * @param res
   */
  addTorrent: (req, res) => {
    var socketHandler = req.app.get('socket_handler');
    Client.add(req.body.torrentUrl).then(result => {
      NotificationMgr.emit('notification:new', {
        type: 'note',
        title: 'new ep!',
        message: 'new ep!',
        body: 'new ep'
      });
      socketHandler.emit('notification:success', { title: 'Added torrent', message: 'Great Success' });
      return res.send(result);
    },
    err => {
      socketHandler.emit('notification:error', { title: 'Torrent failed to add', message: err.message });
      return res.send(500, { error: 'Could not add torrents', message: err });
    }
    );
  },

  /**
   * Searches for torrents that are english translated only from NyaaTorrents
   * @param req
   * @param res
   */
  search(req, res) {
    var search = req.query.name;
    var searcher = new TorrentSearcher();

    searcher.search(search).then(
      // Success callback
      results => {
        res.send(results.filter(item => {
          return item.categories.indexOf('english-translated-anime') > 0;
        }).map(e => {
          var tHelper = new TorrentHelper(e);
          return tHelper.addNewAttributes();
        }));
      },
      // Failure callback
      err => {
        handleErr(err, {term: search}, (err, results) => {
          console.log(results);
        });
      });
  },

  updateTorrentServerDetails(req, res) {
    const torrentDetails = req.body.torrentServer;
    req.app.get('socket_handler').emit('torrent_server:listing', torrentDetails);
    return res.json({ status: 'SUCCESS', message: 'Torrent server details posted' });
  }
};
