/**
 * Created by nathan on 5/10/14.
 */

socket = io.connect('localhost');

socket.on('news', function (data) {
    console.log(data);
    socket.emit('other_event', { my: 'Data' });
});

socket.on('adding_torrent', function (data) {
    console.log(data);
});
