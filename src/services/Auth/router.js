/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwtFactory = require('./Strategies/Jwt');

module.exports = (app) => {
  const appConfig = app.get('app_config');
  const successRedirect = appConfig.anilist.successRedirect;

  router.get('/anilist', passport.authenticate('anilist'));

  router.get('/anilist/callback', passport.authenticate('anilist'), (req, res) => {
    const jwt = jwtFactory(app, appConfig, req.user);
    const token = jwt.sign({ _id: req.user });
    res.cookie('jwt', token);
    return res.redirect(successRedirect);
  });

  router.post('/jwt/token', (req, res) => {
    app.getModel('user')
      .findOne({ email: req.body.email }, (err, user) => {
        if (err) {
          return res.status(400).json(err);
        }

        if (!user) {
          return res.status(404).json({
            message: 'User not found'
          });
        }

        user.authenticate(req.body.password)
          .then(isMatch => {
            if (!isMatch) {
              return res.status(403).json({
                message: 'Invalid password'
              });
            }

            const jwt = jwtFactory(app, appConfig, user);
            const token = jwt.sign({ _id: user._id });
            return res.json({ token: token });
          })
      });
  });

  router.post('/jwt/login', passport.authenticate('jwt'), (req, res) => {
    return res.json(req.user);
  });

  // router.post('/register', (req, res) => {
  //
  //   req.app.getModel('user').create({
  //     email: req.body.email,
  //     password: req.body.password
  //   }, err => {
  //     if (err) {
  //       return res.status(500).json({ message: err });
  //     }
  //
  //     passport.authenticate('local')(req, res, () => {
  //       return res.json({ message: 'Registered' });
  //     });
  //   });
  // });
  //
  return router;

};
