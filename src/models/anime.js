"use strict";
var Mongoose = require('mongoose'),
    Schema = Mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Cache = require('./cache'),
    Episode = require('./episode');

var AnimeSchema = new Schema({
    designated_subgroup: String,
    title: String,
    normalizedName: String,
    episodes: ObjectId,
    filepath: String,
    filenames: Array,
    ann_id: Number
});

function readAnimeDirectory(done) {
    var AnimeDirectory = require('./anime_directory');
    AnimeDirectory.generateModels(done)
}

function getSubGroups(done) {
    var SubGroups = require('./subgroup');
    SubGroups.build(done);
}

/**
 * Flushes the collection of Anime on the Mongo DB
 * @param done
 */
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
        readAnimeDirectory(function () {
            getSubGroups(function (subgroups) {
                var Subgroup = require('./subgroup');
                Subgroup.create(subgroups, function (err) {
                    if (err) console.log(err);
                    done();
                });
            });
        });
    });
};

AnimeSchema.statics.readAnimeDirectory = readAnimeDirectory;
AnimeSchema.statics.flushAnimeCollection = flushCollection;

module.exports = Mongoose.model('Anime', AnimeSchema);
