/**
 * Created by nathan on 3/16/14.
 */

const AnimeNewsNetwork = require('../resources/ann');
const Cache = require('../modules/cache');

/**
 * @constructor
 */
module.exports = {
  search: function (req, res) {
    var Google = req.app.getHelper('google');
    var googleConfig = req.app.get('app_config').google;
    var ann = new AnimeNewsNetwork(new Google(googleConfig));

    ann.search(req.query).then(response => {
        Cache.set(req.url, response);
        return res.send(response);
    }, err => {
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
