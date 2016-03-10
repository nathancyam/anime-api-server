/**
 * Created by nathan on 5/10/14.
 */

// First we need to tie this with the Express app that currently running and don't create a new one needlessly

/**
 * @constructor
 * @type {exports}
 */
var SocketHandler = module.exports = (function () {
    var io = null,
        readySocket = null;
    return {
        /**
         * Sets the Express server to this socket handler
         * @param server
         */
        setServer: function (server) {
            if (!io) {
                io = require('socket.io').listen(server);
            }
        },
        /**
         * Get the server instance
         * @returns {*}
         */
        getServer: function () {
            if (!io) {
                throw new Error('Socket.io has not been set');
            }
            return io;
        },
        /**
         * Initialises the socket connection with the client
         */
        initConnection: function () {
            if (io) {
                io.sockets.on('connection', function (socket) {
                    readySocket = socket;

                    // TODO: I really don't like having to put ALL the event listeners to one section
                    socket.on('client_torrent', function (data) {
                        console.log(data);
                    });

                    socket.on("notifications:clear", function (data) {
                        var Notification = require('../models/notification');
                        Notification.collection.remove(function () {
                            console.log('Cleared nofiication collection');
                        });
                    });
                });
            }
        },
        /**
         * Wrapper for the 'on' event
         * @param status
         * @param cb
         */
        on: function (status, cb) {
            if (io) {
                io.sockets.on(status, cb);
            }
        },
        /**
         * Wrapper for the 'emit' event
         * @param status
         * @param data
         */
        emit: function (status, data) {
            if (io) {
                io.emit(status, data);
            }
        }
    };
})();
