/**
 * Created by nathan on 3/16/14.
 */

var AnimeNewsNetwork = require('../resources/ann'),
    Cache = require('../modules/cache');

/**
 * @constructor
 */
module.exports = {
  search: function (req, res) {
    var ann = new AnimeNewsNetwork();

    ann.search(req.query).then(function (response) {
        Cache.set(req.url, response);
        return res.send(response);
    }, function (err) {
        return res.send(err);
    });
  },
  getListing: function (req, res) {
    var ann = new AnimeNewsNetwork();

    ann.getAnimeListing().then(function (response) {
        Cache.set(req.url, response);
        return res.send(response);
    }, function (err) {
        return res.send(err);
    });
  }
};
