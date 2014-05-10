/**
 * Created by nathan on 5/10/14.
 */

// First we need to tie this with the Express app that currently running and don't create a new one needlessly
var SocketHandler = module.exports = function (server) {
    var io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {
        socket.emit('news', { hello: 'World' });
        socket.on('other_event', function (data) {
            console.log(data);
        });
    });
};

