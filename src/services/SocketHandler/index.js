/**
 * Created by nathanyam on 13/03/2016.
 */

"use strict";
const io = require('socket.io');

class SocketHandler {

  /**
   * @param {Object} app
   */
  constructor(app) {
    this.app = app;
    this.io = io.listen(this.app);
    this.torrentNsp = this.io.of('/torrent_channel');
    this.initConnection();
  }

  initConnection() {
    this.io.sockets.on('connection', socket => {
      this.attachSocketListeners(socket);
    });
  }

  emitToTorrentNamespace(eventName, payload) {
    this.torrentNsp.emit(eventName, payload);
  }

  /**
   * @param {Socket} socket
   */
  attachSocketListeners(socket) {
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  }

  /**
   * @param {String} action
   * @param {Function} callback
   */
  on(action, callback) {
    this.io.sockets.on(action, callback);
  }

  /**
   * @param {String} action
   * @param {Object} payload
   */
  emit(action, payload) {
    this.io.emit(action, payload);
  }
}

exports.SocketHandler = SocketHandler;
