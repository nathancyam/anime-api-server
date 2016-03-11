/**
 * Created by nathan on 4/6/14.
 */
/*jslint node: true */
"use strict";
var Anime = require('../models/anime'),
    Cache = require('../modules/cache'),
    SocketHandler = require('../modules/socket_handler'),
    _ = require('lodash');

/**
 * @constructor
 */
module.exports = {
  /**
   * Gets a list of all the anime model stored on the DB.
   * Sets a cached response
   * @param req
   * @param res
   */
  list: function (req, res) {
    Anime.find({}).sort('title')
      .exec(function (err, results) {
        res.send(results);
      });
  },

  /**
   * Search for an anime
   * @param req
   * @param res
   */
  search: function (req, res) {
    Anime.find(req.query, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  },

  /**
   * Search for an anime by ID
   * @param req
   * @param res
   */
  findById: function (req, res) {
    Anime.findOne({_id: req.params.id}, function (err, result) {
      res.json(result);
    });
  },

  /**
   * Finds an anime on the DB by their name.
   * Sets a cached response.
   * @param req
   * @param res
   */
  findByName: function (req, res) {
    var normalizedQueryName = req.params.name.replace(/\W/g, '').toLowerCase();
    Anime.find({normalizedName: normalizedQueryName}, function (err, animes) {
      Cache.set(req.url, animes);
      res.send(animes);
    });
  },

  /**
   * Clears the DB of the anime collection and rebuilds them from the file system
   * @param req
   * @param res
   */
  sync: function (req, res) {
    Anime.syncDb(function (err, result) {
      if (err) {
        SocketHandler.emit('notification:error', {title: 'Failed to synchronise', message: err.message});
        res.json({status: 'ERROR', message: err.message});
      } else {
        SocketHandler.emit('notification:success', {
          title: 'Successfully synchronised',
          message: 'Synchronised with the file system.'
        });
        res.json(result);
      }
    });
  },

  createEps: function (req, res) {
    var helper = require('./episode');
    helper.createEpisodeModels(function () {
      var Episode = require('./episode');
      Episode.find(function (err, results) {
        res.send(results);
      });
    });
  },

  save: function (req, res) {
    var body = req.body;
    // If the anime's id has been specified, we can then save the anime
    if (body._id) {
      Anime.findById(body._id, function (err, result) {
        // Add a check to stop pointless saves
        if (!_.isEqual(body, result)) {
          result = _.extend(result, body);
          result.save(function (err, dbResult) {
            if (err) console.log(err);
            res.send(dbResult);
          });
        } else {
          res.send({message: "No changes made. Not saving"});
        }
      });
    }
  },

  updateConfig: function (req, res) {
    var config = req.body;
    Cache.set('animeUpdaterConfig', config);
    res.json({status: 'SUCCESS', message: 'Configuration saved'});
  },

  getImage: function (req, res) {
    var id = req.params.id;

    Anime.findById(id, function (err, result) {
      if (err) {
        return res.send(500, 'Oops, an error occurred');
      }

      result.getPictureUrl(function (err, image) {
        if (err) {
          return res.send(500, 'Cound not find file');
        } else {
          return res.json({url: image});
        }
      });
    });
  },

  setImage: function (req, res) {
    var body = req.body,
      animeId = body.animeId,
      imageUrl = body.imageUrl;

    Anime.findById(animeId, function (err, result) {
      if (err) {
        res.send(500);
      } else {
        result.image_url = imageUrl;
        result.save(function () {
          res.json({status: 'Successfully set anime image.'});
        });
      }
    });
  }
}
