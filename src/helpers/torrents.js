/**
 * Created by nathan on 5/24/14.
 */

/*jslint node: true*/
"use strict";

/**
 * @constructor
 */
module.exports = (function () {
    const torrentServerListing = [];

    return function (torrent) {
        this.addNewAttributes = function () {
          torrent.readableSize = torrent.size;
            this.setStatus();
            return torrent;
        };

        this.setStatus = function () {
            const isOnServer = torrentServerListing.some(e => {
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

