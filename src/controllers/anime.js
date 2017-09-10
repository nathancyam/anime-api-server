/**
 * Created by nathan on 4/6/14.
 */
/*jslint node: true */
"use strict";

const router = require('express').Router();
const animeValidation = require('./middleware/anime').validation;

router.get('/search', (req, res) => {
  req.app.getModel('anime')
    .find(req.query, (err, result) => {
      if (err) {
        console.log(err);
      }

      res.json(result);
    });
});

router.get('/image/:id', (req, res) => {
  const id = req.params.id;

  req.app.getModel('anime')
    .findById(id, (err, result) => {
      if (err) {
        return res.send(500, 'Oops, an error occurred');
      }

      result.getPictureUrl((err, image) => {
        if (err) {
          return res.send(500, 'Cound not find file');
        }

        return res.json({ url: image });
      });
    });
});

router.post('/image/:id', (req, res) => {
  const { animeId, imageUrl } = req.body;
  if (!animeId || !imageUrl) {
    return res.status(400).send({ status: 'Request do not include an anime ID and/or image URL'});
  }

  req.app.getModel('anime')
    .findById(animeId, (err, result) => {
      if (err) {
        res.send(500);
      } else {
        result.image_url = imageUrl;
        result.save(function () {
          res.json({status: 'Successfully set anime image.'});
        });
      }
    });
});

router.get('/update', (req, res) => {
  const commandManager = req.app.get('command');
  const updateCommand = commandManager.create('anime_update', { is_watching: true });

  return req.app.get('bus').handle(updateCommand)
    .then(() => {
      return res.json({
        status: 'SUCCESS',
        message: 'Anime updated'
      });
    })
    .catch(err => {
      console.error(err);
      return res.statusCode(500).send(`Error: ${err}`);
    });
});

router.get('/:id', (req, res) => {
  req.app.getModel('anime')
    .findOne({_id: req.params.id}, (err, result) => {
      if (err) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(result);
    });
});

router.post('/:id', animeValidation, (req, res) => {
  req.app.getModel('anime')
    .findByIdAndUpdate(req.params.id, req.body, { upsert: true, 'new': true })
    .then(result => {
      return res.status(200).json(result);
    })
    .catch(err => {
      return res.status(500)
        .json({ message: 'Failed to load anime model', err: err.message });
    });
});

router.delete('/:id', (req, res) => {
  req.app.getModel('anime')
    .remove({ _id: req.params.id }, err => {
      if (err) {
        return res.status(500).json({ message: 'Failed to remove anime with ID: ' + req.params.id });
      }
      return res.status(200).json({ message: 'Deleted anime successfully. '});
    })
});


router.get('/', (req, res) => {
  req.app.getModel('anime')
    .find({})
    .sort('title')
    .exec((err, results) => {
      res.send(results);
    });
});

module.exports = router;
