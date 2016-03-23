/**
 * Created by nathanyam on 13/03/2016.
 */

"use strict";

class SocketHandler {

  /**
   * @param {Object} app
   */
  constructor(app) {
    this.app = app;
    this.io = require('socket.io').listen(this.app);
    this.initConnection();
  }

  initConnection() {
    this.io.sockets.on('connection', socket => {
      this.attachSocketListeners(socket);
    });
  }

  /**
   * @param {Socket} socket
   */
  attachSocketListeners(socket) {
    socket.on('client_torrent', function (data) {
      console.log(data);
    });

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
