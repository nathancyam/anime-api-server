/**
 * Created by nathan on 4/7/14.
 */

"use strict";

const router = require('express').Router();
const EpisodeHelper = require('../helpers/episode');

router.get('/anime/:id', (req, res) => {
  var animeId = req.params.id;
  req.app.getModel('episode')
    .find({ anime: animeId }, (err, results) => {
      res.send(results);
    });
});

router.post('/download', (req, res) => {

  const commandManager = req.app.get('command');
  const episodeCmd = commandManager.create('episode_download');

  return episodeCmd.execute(req.body.filename)
    .then(episode => {
      return res.json({ status: 'SUCCESS', message: 'Episode saved', episode: episode });
    })
    .catch(err => {
      return res.statusCode(500).json({ status: 'ERROR', err: err.message });
    });
});

router.get('/', (req, res) => {
  req.app.getModel('episode')
    .find((err, results) => {
      res.send(results);
    });
});

/**
 * @constructor
 */
module.exports = router;
