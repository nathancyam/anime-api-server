/**
 * Created by nathanyam on 21/03/2016.
 */

"use strict";

const router = require('express').Router();
const jwtFactory = require('../services/Auth/Strategies/Jwt');

const loggedInMiddleware = (req, res, next) => {
  const jwt = jwtFactory(req.app, req.app.get('app_config'));
  const jwtPayload = jwt.verify(req.headers.jwt);

  if (!jwtPayload._id) {
    return res.status(401)
      .json({ message: 'Not authorised' });
  }

  req.app.getModel('user')
    .findOne({ _id: jwtPayload._id }, (err, user) => {
      if (err) {
        return res.status(404)
          .json({ message: 'User not found' });
      }

      if (!err && user) {
        req.user = user;
        req.isLoggedIn = true;
      }

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
  const settings = currentUser.settings || {};
  currentUser.settings = Object.assign({}, settings, req.body.settings);
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
