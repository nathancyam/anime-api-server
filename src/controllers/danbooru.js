/**
 * Created by nathanyam on 25/04/2014.
 */

var Danbooru = require('../helpers/danbooru'),
    Cache = require('../models/cache'),
    danbooru = new Danbooru();

exports.getImages = function(req, res) {
    var name = req.param('name');

    danbooru.getImages([name], function(err, result) {
        Cache.set(req.url, result);
        res.json(result);
    });
};
