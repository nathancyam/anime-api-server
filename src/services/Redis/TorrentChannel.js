/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const TORRENT_CHANNEL = 'torrent';
const ACTION_ADD_TORRENT = 'add_torrent';
const ACTION_MOVE_TORRENT_FILE = 'move_torrent_file';
const ACTION_PAUSE_TORRENT = 'pause_torrent';
const ACTION_RESUME_TORRENT = 'resume_torrent';

class TorrentChannel {

  /**
   * @param {RedisConnector} redisConn
   */
  constructor(redisConn) {
    this.redisConn = redisConn;
  }

  publish(payload, message) {
    message = message || `Success publish of action: ${payload.action}`;
    this.redisConn.publish(TORRENT_CHANNEL, JSON.stringify(payload));
    return { status: 'success', message: message };
  }

  addTorrent(torrentUrl) {
    const torrentPayload = {
      action: ACTION_ADD_TORRENT,
      torrentUrl: torrentUrl
    };

    return this.publish(torrentPayload);
  }

  moveTorrentFiles(torrentId, directory) {
    const payload = {
      action: ACTION_MOVE_TORRENT_FILE,
      torrentId: torrentId,
      destinationDirectory: directory
    };

    return this.publish(payload);
  }

  pauseTorrent(torrentId) {
    const payload = {
      action: ACTION_PAUSE_TORRENT,
      torrentId: torrentId
    };

    return this.publish(payload);
  }

  resumeTorrent(torrentId) {
    const payload = {
      action: ACTION_RESUME_TORRENT,
      torrentId: torrentId
    };
    
    return this.publish(payload);
  }
}

module.exports = TorrentChannel;