/**
 * Created by nathanyam on 21/03/2016.
 */

"use strict";

const router = require('express').Router();
const jwtFactory = require('../services/Auth/Strategies/Jwt');

const loggedInMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(400).json({
      message: 'Not authorised'
    });
  }

  req.app.getModel('user')
    .findOne((err, user) => {
      if (err) {
        return res.status(404).json({
          message: 'Failed to find user'
        });
      }
      req.user = user;
      return next();
    });
};

router.get('/', (req, res) => {
  let response = {
    user: {},
    isLoggedIn: false
  };

  if (!req.cookies.jwt) {
    return res.json(response);
  }

  const jwt = jwtFactory(req.app, req.app.get('app_config'));
  const jwtPayload = jwt.verify(req.cookies.jwt);


  if (!jwtPayload._id) {
    return res.json(response);
  }

  req.app.getModel('user')
    .findOne({ _id: jwtPayload._id }, (err, user) => {

      if (!err && user) {
        response.user = user;
        response.isLoggedIn = true;
      }

      return res.json(response);
    });
});

router.get('/settings', loggedInMiddleware, (req, res) => {
  let currentUser = req.user;
  const settings = currentUser.settings;
  return res.json(settings);
});

router.post('/settings', loggedInMiddleware, (req, res) => {
  let currentUser = req.user;
  const settings = currentUser.settings;
  currentUser.settings = Object.assign({}, settings, res.body.settings);
  currentUser.save(err => {
    if (err) {
      return res.status(500).json({
        message: 'Failed to save new user settings'
      })
    }
    return res.json({ message: 'Saved settings' });
  });
});

module.exports = router;
