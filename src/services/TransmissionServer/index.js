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
}

module.exports = TransmissionServer;
