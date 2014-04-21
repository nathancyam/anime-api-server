/**
 * Created by nathanyam on 21/04/2014.
 */


var http = require('http'),
    sessionId = null;

exports.addTorrent = function (req, res) {
    addTorrent(function (err, response) {
        res.send(response);
    });
};

function addTorrent(done) {
    var torrentUrl = 'http://www.nyaa.se/?page=download&tid=543896';
    var torrent = {
            method: 'torrent-add',
            arguments: {
                paused: false,
                filename: torrentUrl
            }
        },
        torrentString = JSON.stringify(torrent),
        headers = {
            'Content-Type': 'application/json',
            'Content-Length': torrentString.length
        };

    if (sessionId) {
        headers['X-Transmission-Session-Id'] = sessionId;
    }

    var options = {
        hostname: 'local.rpi',
        port: 9091,
        path: '/transmission/rpc',
        method: 'POST',
        headers: headers
    };

    var torrentReq = http.request(options, function (torrentRes) {
        var responseString = '';
        torrentRes.on('data', function (data) {
            responseString += data;
        });
        torrentRes.on('end', function () {
            if (!sessionId) {
                sessionId = getSessionId(responseString);
                addTorrent(done);
            } else {
                done(null, responseString);
            }
        });
    });

    torrentReq.on('error', function (err) {
        console.log(err);
        done(err, null);
    });

    torrentReq.write(torrentString);
    torrentReq.end();
}

function getSessionId(responseData) {
    var result = responseData.match(/X-Transmission-Session-Id:(.*?)<\/code>/g);
    return result[0].split(' ').pop().match(/(.*?)</)[1];
}
