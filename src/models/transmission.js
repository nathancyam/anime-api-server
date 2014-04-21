/**
 * Created by nathanyam on 21/04/2014.
 */

/*jslint node: true */
var Transmission = require('transmission'),
    async = require('async');

var TransmissionWrapper = module.exports = function (options) {
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
