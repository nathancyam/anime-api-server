/**
 * Created by nathan on 5/24/14.
 */

/*jslint node: true*/
"use strict";

/**
 * @constructor
 */
var TorrentHelper = module.exports = (function () {
    var torrentServerListing = [];

    return function (torrent) {
        this.addNewAttributes = function () {
            this.setReadableSize();
            this.setStatus();
            return torrent;
        };

        this.setReadableSize = function () {
            if (torrent.size === 0) return '0 Bytes';
            torrent.readableSize = Math.round(torrent.size / Math.pow(1024, 2), 2) + ' MB';
        };

        this.setStatus = function () {
            var isOnServer = torrentServerListing.some(function (e) {
                return e.name === torrent.name;
            });
            if (isOnServer) {
                torrent.status = 'added';
            } else {
                torrent.status = 'static';
            }
        };
    };
})();

