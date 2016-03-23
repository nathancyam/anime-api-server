/**
 * Created by nathanyam on 21/03/2016.
 */

"use strict";

const router = require('express').Router();

router.get('/', (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
