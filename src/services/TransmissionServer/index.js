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
    this.socketHandler = redisConn;
  }

  /**
   * @param {Object[]} torrents
   * @returns {Promise.<Object[]>}
   */
  addMultipleTorrents(torrents) {
    return Promise.all(torrents.map(({ url, name }) => this.add(url, name)));
  }

  /**
   * @param {Object|Object[]} url
   * @param {String} name
   * @returns {Promise.<Object|Object[]>}
   */
  add(url, name = '') {
    if (Array.isArray(url)) {
      return this.addMultipleTorrents(url);
    }

    return Promise.resolve(this.socketHandler.addTorrent(url, name));
  }

  /**
   * @param {String} torrentId
   * @param {String} destination
   * @returns {Promise.<{status, message}>}
   */
  moveTorrentFiles(torrentId, destination) {
    return Promise.resolve(this.socketHandler.moveTorrentFiles(torrentId, destination));
  }

  resumeTorrent(torrentId) {
    return Promise.resolve(this.socketHandler.resumeTorrent(torrentId));
  }

  pauseTorrent(torrentId) {
    return Promise.resolve(this.socketHandler.pauseTorrent(torrentId));
  }

  forceUpdate() {
    return Promise.resolve(this.socketHandler.forceUpdateListing());
  }
}

module.exports = TransmissionServer;
