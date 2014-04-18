/**
 * Cache Helper file
 */

var Cache = require('../models/cache');

exports.getCacheResponse = function (req, res, next) {
    if (Cache.has(req.url)) {
        res.send(Cache.get(req.url));
    } else {
        next();
    }
};

