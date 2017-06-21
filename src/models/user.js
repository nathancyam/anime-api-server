/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const uuid = require('node-uuid');
const SALT_WORK_FACTOR = 10;

const userSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
  settings: {
    redisApiKey: { type: String, unique: true },
    keys: {
      authSecret: { type: String },
      endpoint: { type: String },
      key: { type: String },
    }
  },
  anilistId: { type: Number, unique: true },
  anilistAccessToken: String,
  anilistRefreshToken: String
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (!this.settings.redisApiKey) {
    this.settings.redisApiKey = uuid.v4();
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

userSchema.methods.toJSON = function () {
  let userJson = this.toObject();
  delete userJson.password;
  return userJson;
};

userSchema.methods.authenticate = function(password) {
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
