/**
 * Created by nathanyam on 3/04/2016.
 */

"use strict";

const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = (app, config) => {

  const userModel = app.getModel('user');

  const _getSecret = () => config.jwt.secret;

  return {
    verify(token) {
      return jwt.verify(token, _getSecret());
    },

    sign(contents) {
      return jwt.sign(contents, _getSecret());
    },

    strategy() {
      return new JwtStrategy({
        secretOrKey: _getSecret(),
        jwtFromRequest: ExtractJwt.fromHeader('jwt')
      }, (jwtPayload, done) => {
        userModel.findOne({ _id: jwtPayload._id }, (err, user) => {
          if (err) {
            return done(err);
          }

          if (!user) {
            return done(null, false, { message: 'No user found.' });
          }

          return done(null, user);
        });
      })
    }
  }
};
