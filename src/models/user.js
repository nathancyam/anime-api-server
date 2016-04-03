/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  settings: {
    redisApiKey: String
  },
  anilistId: Number,
  anilistAccessToken: String,
  anilistRefreshToken: String
});

module.exports = mongoose.model('User', userSchema);
