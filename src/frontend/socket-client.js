/**
 * Created by nathan on 5/10/14.
 */

var socket = io();

socket.on('news', function (data) {
    console.log(data);
    socket.emit('other_event', { my: 'Data' });
});

socket.on('torrent_add_success', function (data) {
    console.log(data);
});

socket.on('torrent_add_error', function (data) {
    console.log(data);
});
