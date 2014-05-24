/**
 * Created by nathan on 5/24/14.
 */

/*jslint node: true*/
"use strict";

var TorrentHelper = module.exports = function (torrent) {
    return {
        addNewAttributes: function () {
            this.setReadableSize();
            this.setStatus();
            return torrent;
        },
        setReadableSize: function () {
            if (torrent.size === 0) return '0 Bytes';
            torrent.readableSize = Math.round(torrent.size / Math.pow(1024, 2), 2) + ' MB';
        },
        setStatus: function () {
            torrent.status = 'static';
        }
    };
};

