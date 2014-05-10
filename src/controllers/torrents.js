/**
 * Created by nathanyam on 21/04/2014.
 */

var Transmission = require('../models/transmission'),
    SocketHandler = require('../modules/socket_handler'),
    NyaaTorrents = require('nyaatorrents');

var Client = new Transmission({
        host: 'local.rpi',
        port: 9091
    }),
    NT = new NyaaTorrents();

exports.addTorrent = function (req, res) {
    Client.add(req.body.torrentUrl, function (err, result) {
        res.send(result);
    });
};

exports.search = function (req, res) {
    var search = req.query.name;
    NT.search({ term: search }, function (err, results) {
        res.send(results.filter(function (item) {
            return item.categories.indexOf('english-translated-anime') > 0;
        }).map(function (item) {
            item.readableSize = bytesToSize(item.size);
            return item;
        }));
    });
};

function bytesToSize(bytes) {
    if (bytes == 0) return '0 Bytes';
    return Math.round(bytes / Math.pow(1024, 2), 2) + ' MB';
}
