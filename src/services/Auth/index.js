/**
 * Created by nathanyam on 18/03/2016.
 */

'use strict';

const passport = require('passport');
const anilistOAuthStrategyFactory = require('./Strategies/Anilist');
const localAuthFactory = require('./Strategies/Local');

module.exports = (app, config) => {
  app.use(passport.initialize());
  app.use(passport.session());

  let User = app.getModel('user');

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  const anilistOAuthStrategy = anilistOAuthStrategyFactory(
    passport,
    User,
    app,
    config
  );

  const localAuth = localAuthFactory(passport, User);

  passport.use('anilist', anilistOAuthStrategy);
  passport.use('local', localAuth);
};

