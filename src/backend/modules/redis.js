/**
 * Created by nathanyam on 2/03/2016.
 */

"use strict";
const TORRENT_CHANNEL = 'torrent';
const ACTION_ADD_TORRENT = 'add_torrent';

var config = require('../config');
var Redis = require('ioredis');
var redisConn = new Redis(config.redis.port, config.redis.host);

/**
 * @param {String} torrentUrl
 */
exports.addTorrent = function addTorrent(torrentUrl) {
  const torrentPayload = {
    action: ACTION_ADD_TORRENT,
    torrentUrl: torrentUrl
  };

  redisConn.publish(TORRENT_CHANNEL, JSON.stringify(torrentPayload));
  return { status: 'success', message: `Published torrent addition to Redis`}
};
