"use strict";
var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Cache = require('./cache');
var Episode = require('./episode');

var AnimeSchema = new Schema({
    title: String,
    normalizedName: String,
    episodes: ObjectId,
    filepath: String,
    filenames: Array
});

function readAnimeDirectory(done) {
    var AnimeDirectory = require('./anime_directory');
    return AnimeDirectory.generateModels(done)
}

function flushCollection(done) {
    Mongoose.connection.collections['animes'].drop(function (err) {
        if (err) {
            console.log(err);
        }
        Episode.sync(function () {
            done();
        });
    });
}

AnimeSchema.methods.setLowerCase = function () {
    this.normalizedName = this.title.replace(/\W/g, '').toLowerCase();
};

AnimeSchema.statics.syncDb = function (done) {
    flushCollection(function () {
        readAnimeDirectory(done);
    });
};

AnimeSchema.statics.readAnimeDirectory = readAnimeDirectory;
AnimeSchema.statics.flushAnimeCollection = flushCollection;

module.exports = Mongoose.model('Anime', AnimeSchema);
