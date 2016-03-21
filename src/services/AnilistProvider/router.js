/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/anilist', passport.authenticate('anilist'));
router.get('/anilist/callback', passport.authenticate('anilist', {
  successRedirect: 'http://localhost:1337/',
  failureRedirect: 'http://localhost:1337/login'
}));

module.exports = router;