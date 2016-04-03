/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const express = require('express');
const passport = require('passport');
const router = express.Router();

module.exports = (app) => {
  const appConfig = app.get('app_config');
  const successRedirect = appConfig.anilist.successRedirect;
  const failureRedirect = appConfig.anilist.failureRedirect;

  router.get('/anilist', passport.authenticate('anilist'));

  router.get('/anilist/callback', passport.authenticate('anilist', {
    successRedirect: successRedirect,
    failureRedirect: failureRedirect
  }));

  return router;
};