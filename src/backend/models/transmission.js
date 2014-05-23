/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true */
"use strict";

var Transmission = require('transmission'),
    config = require('../config'),
    async = require('async');

var TransmissionWrapper = module.exports = function TransmissionWrapper(options) {
    options = options || config.torrentServer;
    Transmission.call(this, options);
};

TransmissionWrapper.prototype = Object.create(Transmission.prototype, {
    addMultipleTorrents: {
        value: function (torrents, done) {
            var self = this;
            async.each(torrents, function (item, next) {
                self.add(item, function (err) {
                    if (err) next(err);
                    next();
                });
            }, function (err) {
                if (err) console.log(err);
                done(null, { status: 'success' });
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
