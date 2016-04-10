/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true*/
"use strict";

const router = require('express').Router();
const moment = require('moment');

/**
 * Adds a torrent to the torrent server
 * @param req
 * @param res
 */
router.post('/add', (req, res) => {
  const socketHandler = req.app.get('socket_handler');
  const torrentServer = req.app.get('torrent_server');
  const notificationManager = req.app.get('notification_manager');

  torrentServer.add(req.body.torrentUrl).then(result => {
      socketHandler.emit('notification:success', { title: 'Added torrent', message: 'Great Success' });
      notificationManager.emit('notification:new', {
        type: 'note',
        title: 'New Torrent Added',
        message: `Torrent Added ${req.body.meta.name}`,
        body: `Torrent Added ${req.body.meta.name}`
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
    let now = moment();
    let torrentEta = moment().add(torrent.eta, 'seconds');
    let days = torrentEta.diff(now, 'days');
    let hours = torrentEta.diff(now, 'hours');
    let minutes = torrentEta.diff(now, 'minutes');
    let seconds = torrentEta.diff(now, 'seconds');

    days = days ? `${days} days` : '';
    hours = hours ? `${hours} hours` : '';
    minutes = minutes ? `${minutes} minutes` : '';
    seconds = seconds ? `${seconds} seconds` : '';

    let humanEta = [days, hours, minutes, seconds].join(' ');
    return Object.assign({}, torrent, { humanEta });
  });

  req.app.get('socket_handler').emit('torrent_server:listing', torrents);
  return res.json({ status: 'SUCCESS', message: 'Torrent server details posted' });
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