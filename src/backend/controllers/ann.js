/**
 * Created by nathan on 3/16/14.
 */

var AnimeNewsNetwork = require('../resources/ann'),
    Cache = require('../modules/cache');

exports.search = function (req, res) {
    var ann = new AnimeNewsNetwork();
    ann.search(req.query, function (err, response) {
        Cache.set(req.url, response);
        res.send(response);
    });
};
