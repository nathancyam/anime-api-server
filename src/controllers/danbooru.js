/**
 * Created by nathanyam on 25/04/2014.
 */

var Danbooru = require('../resources/danbooru'),
    Cache = require('../modules/cache'),
    danbooru = new Danbooru();

/**
 * @constructor
 */
var DanbooruController = module.exports = (function () {
    return {
        getImages: function (req, res) {
            var name = req.param('name');

            danbooru.getImages([name], function (err, result) {
                Cache.set(req.url, result);
                res.json(result);
            });
        }
    };
})();
