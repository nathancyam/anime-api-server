/**
 * Cache Helper file
 */

/*jslint node: true*/
"use strict";

var Cache = require('../modules/cache');

exports.getCacheResponse = function (req, res, next) {
    if (Cache.has(req.url)) {
        res.send(Cache.get(req.url));
    } else {
        next();
    }
};

