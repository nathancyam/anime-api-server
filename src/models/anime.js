"use strict";
var Cache = require('./cache');
var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var ObjectId = Schema.ObjectId;
var q = require('q');

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

function flushCollection() {
    var deferred = q.defer();
    Mongoose.connection.collections['animes'].drop(function (err) {
        if (err) {
            console.log(err);
        }
        var Episode = require('./episode');
        Episode.sync(function () {
            deferred.resolve(null);
        });
    });
    return deferred.promise;
}

AnimeSchema.methods.setLowerCase = function () {
    this.normalizedName = this.title.replace(/\W/g, '').toLowerCase();
};

AnimeSchema.statics.syncDb = function (done) {
    flushCollection().then(function () {
        return readAnimeDirectory();
    }).then(function () {
        done();
    });
};

AnimeSchema.statics.readAnimeDirectory = readAnimeDirectory;
AnimeSchema.statics.flushAnimeCollection = flushCollection;

module.exports = Mongoose.model('Anime', AnimeSchema);
