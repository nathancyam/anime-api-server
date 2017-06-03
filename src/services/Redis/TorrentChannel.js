/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const TORRENT_CHANNEL = 'torrent';
const ACTION_ADD_TORRENT = 'add_torrent';
const ACTION_MOVE_TORRENT_FILE = 'move_torrent_file';
const ACTION_PAUSE_TORRENT = 'pause_torrent';
const ACTION_RESUME_TORRENT = 'resume_torrent';
const ACTION_FORCE_UPDATE = 'force_update';
const ACTION_TORRENT_SERVER_DOWN = 'torrent_server_down';

class TorrentChannel {

  /**
   * @param {SocketHandler} socketHandler
   * @param {NotificationManager} notificationMgr
   */
  constructor(socketHandler, notificationMgr) {
    this.socketHandler = socketHandler;
    this.attachTorrentClientListeners(notificationMgr);
  }

  publish(payload, message) {
    message = message || `Success publish of action: ${payload.action}`;
    this.socketHandler.emitToTorrentNamespace(TORRENT_CHANNEL, payload);
    return { status: 'success', message: message };
  }

  addTorrent(torrentUrl, name = '') {
    const torrentPayload = {
      action: ACTION_ADD_TORRENT,
      torrentUrl,
      name
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

  forceUpdateListing() {
    return this.publish({ action: ACTION_FORCE_UPDATE });
  }

  attachTorrentClientListeners(notificationMgr) {
    const torrentChannel = this.socketHandler.torrentNsp;
    torrentChannel.on('torrent_client', ({ action, message, status }) => {
      let title = status !== 'ok'
        ? `Failed Operation (${action})`
        : `Successful Operation (${action})`;

      // Only notify use if the torrent server is down or if the action involves adding a torrent.
      if ([ACTION_ADD_TORRENT, ACTION_TORRENT_SERVER_DOWN].includes(action)) {
        notificationMgr.emit('notification:new', {
          type: 'note',
          title,
          message,
          body: message,
        });
      }
    });
  }
}

module.exports = TorrentChannel;
