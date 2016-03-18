/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const TORRENT_CHANNEL = 'torrent';
const ACTION_ADD_TORRENT = 'add_torrent';

class TorrentChannel {

  /**
   * @param {RedisConnector} redisConn
   */
  constructor(redisConn) {
    this.redisConn = redisConn;
  }

  addTorrent(torrentUrl) {
    const torrentPayload = {
      action: ACTION_ADD_TORRENT,
      torrentUrl: torrentUrl
    };

    this.redisConn.publish(TORRENT_CHANNEL, JSON.stringify(torrentPayload));
    return { status: 'success', message: `Published torrent addition to Redis`}
  }

}

module.exports = TorrentChannel;