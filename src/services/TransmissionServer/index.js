/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true */
"use strict";

class TransmissionServer {

  /**
   * @param {TorrentChannel} redisConn
   */
  constructor(redisConn) {
    this.redisConn = redisConn;
  }

  /**
   * @param {Object[]} torrents
   * @returns {Promise.<Object[]>}
   */
  addMultipleTorrents(torrents) {
    return new Promise((resolve, reject) => {
      Promise.all(torrents.map(e => this.add(e)))
        .then(results => {
          return resolve(results);
        })
        .catch(err => {
          console.error(err);
          return reject(err);
        })
    });
  }

  /**
   * @param {Object|Object[]} url
   * @returns {Promise.<Object|Object[]>}
   */
  add(url) {
    if (Array.isArray(url)) {
      return this.addMultipleTorrents(url);
    }

    return Promise.resolve(this.redisConn.addTorrent(url));
  }

  /**
   * @param {String} torrentId
   * @param {String} destination
   * @returns {Promise.<{status, message}>}
   */
  moveTorrentFiles(torrentId, destination) {
    return Promise.resolve(this.redisConn.moveTorrentFiles(torrentId, destination));
  }

  resumeTorrent(torrentId) {
    return Promise.resolve(this.redisConn.resumeTorrent(torrentId));
  }

  pauseTorrent(torrentId) {
    return Promise.resolve(this.redisConn.pauseTorrent(torrentId));
  }

  forceUpdate() {
    return Promise.resolve(this.redisConn.forceUpdateListing());
  }
}

module.exports = TransmissionServer;
