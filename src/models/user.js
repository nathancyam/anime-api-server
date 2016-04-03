/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const userSchema = new Schema({
  email: String,
  password: String,
  settings: {
    redisApiKey: String
  },
  anilistId: Number,
  anilistAccessToken: String,
  anilistRefreshToken: String
});

userSchema.pre('save', next => {
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }

      this.password = hash;
      next();
    });
  });
});

userSchema.methods.authenticate = password => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      return resolve(isMatch);
    });
  });
};

module.exports = mongoose.model('User', userSchema);
