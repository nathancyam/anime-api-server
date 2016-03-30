/**
 * Created by nathanyam on 21/03/2016.
 */

"use strict";

const router = require('express').Router();

router.get('/', (req, res) => {
  let response = {};
  if (!req.user) {
    response.user = {};
    response.isLoggedIn = false;
  } else {
    response.user = req.user;
    response.isLoggedIn = true;
  }

  return res.json(response);
});

module.exports = router;
