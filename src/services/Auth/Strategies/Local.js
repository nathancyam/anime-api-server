/**
 * Created by nathanyam on 3/04/2016.
 */

"use strict";

const LocalStrategy = require('passport-local').Strategy;

/**
 * @param passport
 * @param {User} userModel
 * @returns {LocalStrategy}
 */
module.exports = (passport, userModel) => {
  return new LocalStrategy(
    {
      usernameField: 'email'
    },
    (email, password, done) => {
      userModel.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, { message: 'No user found.' });
        }

        user.authenticate(password)
          .then(isMatch => {
            if (!isMatch) {
              return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
          })
          .catch(err => done(err));
      });
    }
  );
};