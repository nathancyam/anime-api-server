/**
 * Created by nathan on 4/6/14.
 */
/*jslint node: true */
"use strict";

const Cache = require('../modules/cache');
const _ = require('lodash');

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
  list(req, res) {
    req.app.getModel('anime')
      .find({})
      .sort('title')
      .exec((err, results) => {
        res.send(results);
      });
  },

  /**
   * Search for an anime
   * @param req
   * @param res
   */
  search(req, res) {
    req.app.getModel('anime')
      .find(req.query, (err, result) => {
        if (err) {
          console.log(err);
        }

        res.json(result);
    });
  },

  /**
   * Search for an anime by ID
   * @param req
   * @param res
   */
  findById(req, res) {
    req.app.getModel('anime')
      .findOne({_id: req.params.id}, (err, result) => {
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

    req.app.getModel('anime')
      .find({normalizedName: normalizedQueryName}, (err, collection) => {
        Cache.set(req.url, collection);
        res.send(collection);
      });
  },

  /**
   * Clears the DB of the anime collection and rebuilds them from the file system
   * @param req
   * @param res
   */
  sync(req, res) {
    const socketHandler = req.app.get('socket_handler');

    req.app.getModel('anime')
      .syncDb((err, result) => {
        if (err) {
          socketHandler.emit('notification:error', {title: 'Failed to synchronise', message: err.message});
          res.json({status: 'ERROR', message: err.message});
        } else {
          socketHandler.emit('notification:success', {
            title: 'Successfully synchronised',
            message: 'Synchronised with the file system.'
          });
          res.json(result);
        }
      });
  },

  createEps(req, res) {
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
      req.app.getModel('anime')
        .findById(body._id, (err, result) => {
          // Add a check to stop pointless saves
          if (!_.isEqual(body, result)) {
            result = _.extend(result, body);
            result.save((err, dbResult) => {
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

    req.app.getModel('anime')
      .findById(id, (err, result) => {
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
  }
}
