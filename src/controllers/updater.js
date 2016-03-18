/**
 * Created by nathanyam on 11/03/2016.
 */

"use strict";

var AutoUpdaterServiceFactory = require('../services/AutoUpdater').factory;

exports.update = (req, res) => {
  req.app.getModel('anime')
    .find({is_watching: true}, (err, animeCollection) => {
      if (err) {
        console.error(err);
        return res.statusCode(500).send(`Error: ${err}`);
      }

      const updaters = AutoUpdaterServiceFactory
        .createCollection(animeCollection, req.app.get('torrent_server'));

      Promise.all(updaters.map(updater => updater.postTorrentsToServer()))
        .then(() => {
          return res.json({status: 'SUCCESS', message: 'Anime updated '});
        })
        .catch(err => {
          console.error(err);
          return res.statusCode(500).send(`Error: ${err}`);
        })
    });
};

