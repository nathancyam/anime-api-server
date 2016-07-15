/**
 * Created by nathan on 3/16/14.
 */

const router = require('express').Router();
const Cache = require('../modules/cache');
const AnnCommand = require('../commands/ann');

router.get('/search', (req, res) => {
  const searcher = req.app.get('ann_searcher');

  searcher.search(req.query)
    .then(response => res.json(response))
    .catch(err => res.json(err));
});

router.get('/google/search', (req, res) => {
  const searcher = req.app.get('ann_google_searcher');

  searcher.searchAnime(req.query.q)
    .then(response => res.json(response))
    .catch(err => res.status(500).json(err));
});

router.post('/update', (req, res) => {
  const { anime: { _id, name }} = req.body;
  const { ann } = req.body;

  if (!_id) {
    return res.status(404).json({ message: 'Anime entity not found' });
  }

  let payload;
  const searcher = req.app.get('ann_searcher');
  
  if (ann && ann.id) {
    payload = { annId: ann.id };
  } else {
    payload = { name }
  }
  
  req.app.getModel('anime')
    .findById(_id)
    .then(animeEntity => {
      const command = AnnCommand.create(searcher, animeEntity, payload);
      return command.handle();
    })
    .then(result => {
      return res.json(result);
    })
    .catch(err => {
      return res.status(500).json({ err });
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
