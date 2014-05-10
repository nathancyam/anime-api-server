/**
 * Created by nathan on 5/10/14.
 */

socket = io.connect('localhost');

socket.on('news', function (data) {
    console.log(data);
    socket.emit('other_event', { my: 'Data' });
});

socket.on('search_torrent_start', function (data) {
    console.log(data);
});
