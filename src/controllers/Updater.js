/**
 * Created by nathanyam on 11/03/2016.
 */

"use strict";

var AutoUpdaterServiceFactory = require('../services/AutoUpdater').factory;
var Anime = require('../models/anime');
var Transmission = require('../models/transmission');

exports.update = (req, res) => {
  Anime.find({is_watching: true}, (err, animeCollection) => {
    if (err) {
      console.error(err);
      return res.statusCode(500).send(`Error: ${err}`);
    }

    const transmissionServer = new Transmission();
    const updaters = AutoUpdaterServiceFactory.createCollection(animeCollection, transmissionServer);

    Promise.all(updaters.map(updater => updater.postTorrentsToServer()))
      .then(result => {
        return res.json({status: 'SUCCESS', message: 'Anime updated '});
      })
      .catch(err => {
        console.error(err);
        return res.statusCode(500).send(`Error: ${err}`);
      })
  });
}

