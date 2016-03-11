/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true */
"use strict";

var async = require('async');
var Q = require('q');
var Transmission = require('transmission');
var util = require('util');
var redisConn = require('../modules/redis');

var config = require('../config');

/**
 * @constructor
 * @type {TransmissionWrapper}
 */
var TransmissionWrapper = module.exports = function TransmissionWrapper(options) {
  options = options || config.torrentServer;
  Transmission.call(this, options);
};

/**
 * Format module for Transmission server responses.
 *
 * @type {{formatTorrentResponses: formatTorrentResponses, formatResponseToJson: formatResponseToJson}}
 */
var ResponseFormatter = {
  /**
   * Formats the results from the transmission torrent server to a presentable
   * JSON format.
   *
   * @see Q.allSettled()
   * @param responses Array of resolved promises from the Q.allSettled() method
   */
  formatTorrentResponses: function (responses) {
    var successfulTorrents = [];
    var failedTorrents = [];

    // Split the results to successful/failed additions
    responses.forEach(function (torrent) {
      switch (torrent.state) {
        case 'fulfilled':
          successfulTorrents.push(torrent);
          break;
        case 'rejected':
          failedTorrents.push(torrent);
          break;
        default:
          break;
      }
    });

    var response = {
      message: '',
      responses: {
        successful: this.formatResponseToJson('success', successfulTorrents),
        failed: this.formatResponseToJson('error', failedTorrents)
      }
    };

    if (successfulTorrents.length > 0 && failedTorrents.length === 0) {
      response.message = "Successfully added all torrents to server.";
    } else if (successfulTorrents.length > 0 && failedTorrents.length > 0) {
      response.message = "Failed to add some torrents to the server.";
    } else if (successfulTorrents.length === 0 && failedTorrents.length > 0) {
      response.message = "Failed to add all torrents to the server.";
    }

    return response;
  },
  /**
   * Formats the Transmission server responses to JSON.
   *
   * @param status String
   * @param responses Array
   */
  formatResponseToJson: function (status, responses) {
    var message = "%s %d torrent(s) to the torrent server.";

    if ('success' === status) {
      message = util.format(message, "Successfully added", responses.length);
    }
    if ('error' === status) {
      message = util.format(message, "Failed to add", responses.length);
    }

    var showTorrent = function (array, cb) {
      if (array.length === 0) {
        return false;
      }
    };

    return {
      message: message,
      numberOfTorrents: responses.length,
      torrents: responses.map(function (elem) {
        return elem.value.name
      })
    }
  }
};

TransmissionWrapper.prototype = Object.create(Transmission.prototype, {
  addMultipleTorrents: {
    /**
     * Adds multiple torrents to the Transmission server. Returns a promise containing
     * the responses from the torrent server.
     *
     * @param torrents Array of torrent hyperlinks to be added to the torrent server
     * @returns {Promise<Array>} A promise for the responses from the torrent server
     */
    value: function (torrents) {
      return new Promise((resolve, reject) => {
        Promise.all(torrents.map(e => this.enhancedAdd(e)))
          .then(results => {
            return resolve(ResponseFormatter.formatTorrentResponses(results));
          })
          .catch(err => {
            console.error(err);
            return reject(err);
          })
      });
    }
  },

  add: {
    value: function (url, options, cb) {
      if (Array.isArray(url)) {
        if (typeof options === 'function') {
          cb = options;
        }
        return this.addMultipleTorrents(url);
      } else {
        return this.enhancedAdd(url, options);
      }
    }
  },

  enhancedAdd: {
    /**
     * Wrapper to add torrents to the Transmission server. Handles errors slightly
     * better to ensure we can see the URL was not successfully added to the torrent
     * server.
     *
     * @param {String} url
     * @returns {Promise.<Object>}
     */
    value: function (url) {
      return Promise.resolve(redisConn.addTorrent(url));
    }
  }
});
