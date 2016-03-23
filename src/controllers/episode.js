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
  /** @var NotificationManager notificationManager */
  const notificationManager = req.app.get('notification_manager');
  const filename = req.body.filename;
  const episodeFileRegexp = /^\[([\w\W]{0,})\]\s(.*)\s-\s(\d{2,3})/;
  const filenameElements = filename.match(episodeFileRegexp);
  const episodeAttributes = {
    subgroup: filenameElements[1],
    animeTitle: filenameElements[2],
    number: filenameElements[3],
    filename: filename
  };

  EpisodeHelper.setEpisodeModelToAnime(episodeAttributes)
    .then(episode => {
      notificationManager.emit('notification:new', {
        type: 'note',
        title: `New Episode: ${episodeAttributes.animeTitle}`,
        message: `${episodeAttributes.filename}`,
        body: `Download finish: ${episodeAttributes.filename}`
      });
      return res.json({ status: 'SUCCESS', message: 'Episode saved', episode: episode });
    })
    .catch(() => {
      return res.statusCode(500).send("Failed to create episode model.");
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
