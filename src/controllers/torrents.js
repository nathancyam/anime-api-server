/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true*/
"use strict";

const router = require('express').Router();
const moment = require('moment');
require('moment-duration-format');

/**
 * Adds a torrent to the torrent server
 * @param req
 * @param res
 */
router.post('/add', (req, res) => {
  const socketHandler = req.app.get('socket_handler');
  const torrentServer = req.app.get('torrent_server');
  const notificationManager = req.app.get('notification_manager');
  const { torrentUrl, meta: { name } } = req.body;

  if (!torrentUrl) {
    return res.send(400, { error: 'Torrent URL not specified.' });
  }

  torrentServer.add(torrentUrl, name)
    .then(result => {
      socketHandler.emit('notification:success', { title: 'Added torrent', message: 'Great Success' });
      notificationManager.emit('message', {
        type: 'note',
        title: 'New Torrent Added',
        message: `Torrent Added ${name}`,
        body: `Torrent Added ${name}`
      });

      return res.send(result);
    },
    err => {
      socketHandler.emit('notification:error', { title: 'Torrent failed to add', message: err.message });
      return res.send(500, { error: 'Could not add torrents', message: err });
    }
  );
});

router.post('/server', (req, res) => {
  const torrentDetails = req.body.torrentServer;
  let torrents = torrentDetails.map(torrent => {
    let humanEta = moment
      .duration(torrent.eta, 'seconds')
      .format('h [hours] m [minutes] s [seconds]');

    return Object.assign({}, torrent, { humanEta });
  });

  req.app.get('socket_handler').emit('torrent_server:listing', torrents);
  return res.json({ status: 'SUCCESS', message: 'Torrent server details posted' });
});

router.post('/server/update', (req, res) => {
  req.app.get('torrent_server')
    .forceUpdate()
    .then(() => {
      return res.json({ message: 'Forced torrent update' });
    })
});

router.post('/move/:torrentId/anime/:animeId', (req, res) => {
  const torrentServer = req.app.get('torrent_server');

  req.app.getModel('anime')
    .findOne({ _id: req.params.animeId }, (err, anime) => {
      if (err) {
        return res.status(400).json({ message: 'Anime not found' });
      }

      torrentServer
        .moveTorrentFiles(req.params.torrentId, anime.filepath)
        .then(res => {
          return res.json({ status: 'success' });
        });
    });
});

router.post('/pause/:torrentId', (req, res) => {
  req.app.get('torrent_server')
    .pauseTorrent(req.params.torrentId)
    .then(response => res.json(response));
});

router.post('/resume/:torrentId', (req, res) => {
  req.app.get('torrent_server')
    .resumeTorrent(req.params.torrentId)
    .then(response => res.json(response));
});

module.exports = router;
