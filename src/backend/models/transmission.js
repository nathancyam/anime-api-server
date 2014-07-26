/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true */
"use strict";

var Transmission = require('transmission'),
    config = require('../config'),
    async = require('async');

/**
 * @constructor
 * @type {TransmissionWrapper}
 */
var TransmissionWrapper = module.exports = function TransmissionWrapper(options) {
    options = options || config.torrentServer;
    Transmission.call(this, options);
};

TransmissionWrapper.prototype = Object.create(Transmission.prototype, {
    /**
     * Adds multiple torrents to the server
     */
    addMultipleTorrents: {
        value: function (torrents, done) {
            var self = this;
            async.each(torrents, function (item, next) {
                self.add(item, function (err) {
                    if (err) {
                        next(err);
                    } else {
                        next();
                    }
                });
            }, function (err) {
                if (err) {
                    console.log(err);
                    return done(new Error(err), null);
                }
                var successObj = {
                    status: 'SUCCESS',
                    message: 'Successfully added ' + torrents.length + ' to the torrent server',
                    torrents: torrents
                };
                done(null, successObj);
            });
        }
    },
    add: {
        value: function (url, options, cb) {
            if (Array.isArray(url)) {
                if (typeof options === 'function') {
                    cb = options;
                }
                this.addMultipleTorrents(url, cb);
            } else {
                Transmission.prototype.add.apply(this, [url, options, cb]);
            }
        }
    }
});
