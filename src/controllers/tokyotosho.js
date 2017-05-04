/**
 * Created by nathan on 5/4/17.
 */

const router = require('express').Router();


router.get('/search', (req, res) => {
  const { name } = req.query;
  const tToshoClient = req.app.get('tokyo_tosho');

  tToshoClient.search(name)
    .then(result => res.send(result));

});

module.exports = router;
