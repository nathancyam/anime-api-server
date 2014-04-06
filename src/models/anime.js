"use strict";
var Cache = require('./cache');
var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var ObjectId = Schema.ObjectId;

var AnimeSchema = new Schema({
    title: String,
    normalizedName: String,
    episodes: ObjectId,
    filepath: String,
    filenames: Array
});

AnimeSchema.methods.setLowerCase = function () {
    this.normalizedName = this.title.replace(/\W/g, '').toLowerCase();
};

module.exports = Mongoose.model('Anime', AnimeSchema);
