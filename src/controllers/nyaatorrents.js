/**
 * Created by nathanyam on 26/03/2016.
 */

"use strict";

const router = require('express').Router();
const TorrentHelper = require('../helpers/torrents');
const NyaaTorrents = require('nyaatorrents');

const NT = new NyaaTorrents();
const RETRY_ATTEMPTS = 10;

/**
 * Handle the errors from NyaaTorrents since we do get timeout issues. Thanks DDOS.
 * @param err
 * @param searchTerms
 * @param cb
 * @param attempts
 */
const handleErr = function handleErr(err, searchTerms, cb, attempts) {
  attempts = attempts || 0;

  // We have a timeout issue here.
  if (err.code === 'ETIMEOUT' && attempts < RETRY_ATTEMPTS) {
    NT.search(searchTerms, function (err, results) {
      if (attempts < 3) err = { code: 'ETIMEOUT' };
      if (err) {
        return handleErr(err, searchTerms, cb, ++attempts);
      } else {
        return cb(null, results);
      }
    });
  } else {
    return cb(err, null);
  }
};


router.get('/search', (req, res) => {
  var search = req.query.name;
  var searcher = req.app.get('nyaatorrents');

  searcher.search(search).then(
    // Success callback
    results => {
      res.send(results.filter(item => {
        return item.categories.indexOf('english-translated-anime') > 0;
      }).map(e => {
        var tHelper = new TorrentHelper(e);
        return tHelper.addNewAttributes();
      }));
    },
    // Failure callback
    err => {
      handleErr(err, {term: search}, (err, results) => {
        console.log(results);
      });
    });
});

module.exports = router;