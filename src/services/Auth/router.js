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

  router.post('/login', passport.authenticate('local'), (req, res) => {
    if (req.user) {
      let user = req.user;
      delete user.password;
      return res.json(user);
    }
  });

  router.post('/register', (req, res) => {

    req.app.getModel('user').create({
      email: req.body.email,
      password: req.body.password
    }, err => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      passport.authenticate('local')(req, res, () => {
        return res.json({ message: 'Registered' });
      });
    });
  });

  return router;

};