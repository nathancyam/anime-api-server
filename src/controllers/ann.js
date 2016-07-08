/**
 * Created by nathan on 3/16/14.
 */

const router = require('express').Router();

const AnimeNewsNetwork = require('../resources/ann');
const Cache = require('../modules/cache');

router.get('/search', (req, res) => {
  const searcher = req.app.get('ann_searcher');

  searcher.search(req.query).then(response => {
    Cache.set(req.url, response);
    return res.send(response);
  }, err => {
    return res.send(err);
  });
});

router.get('/search/all', (req, res) => {
  var ann = new AnimeNewsNetwork();

  ann.getAnimeListing().then(function (response) {
    Cache.set(req.url, response);
    return res.send(response);
  }, function (err) {
    return res.send(err);
  });
});

module.exports = router;
