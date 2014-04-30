/**
 * Created by nathan on 3/16/14.
 */

var ann = require('../helpers/ann'),
    Cache= require('../models/cache');

exports.search = function (req, res) {
    ann.searchRouter(req.query, function (err, apiResponse) {
        if (!err && !ann.isEmpty(apiResponse)) {
            ann.hasOneResult(apiResponse, function(err, result) {
                Cache.set(req.url, result);
                res.send(result);
            });
        } else if (ann.isEmpty(apiResponse)) {
            ann.handleEmptyResponse(apiResponse, function(err, result) {
                Cache.set(req.url, result);
                res.send(result);
            });
        }
    })
};
