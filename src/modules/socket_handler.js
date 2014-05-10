/**
 * Created by nathan on 5/10/14.
 */

// First we need to tie this with the Express app that currently running and don't create a new one needlessly
var io = null,
    readySocket = null;

exports.setServer = function (server) {
    if (!io) {
        io = require('socket.io').listen(server);
    }
};

exports.initConnection = function () {
    if (io) {
        io.sockets.on('connection', function (socket) {
            readySocket = socket;

            // TODO: I really don't like having to put ALL the event listeners to one section
            socket.on('client_torrent', function (data) {
                console.log(data);
            });
        });
    }
};

exports.on = function (status, cb) {
    if (io) {
        io.sockets.on(status, cb);
    }
};

exports.emit = function (status, data) {
    if (readySocket) {
        readySocket.emit(status, data);
    }
};
