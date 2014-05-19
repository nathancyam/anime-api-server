/*jslint node: true*/
"use strict";
var Mongoose = require('mongoose'),
    Schema = Mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Cache = require('./cache'),
    Q = require('q'),
    Episode = require('./episode');

var AnimeSchema = new Schema({
    designated_subgroup: String,
    title: String,
    normalizedName: String,
    episodes: ObjectId,
    filepath: String,
    filenames: Array,
    ann_id: Number,
    is_watching: Boolean,
    is_complete: Boolean
});

function readAnimeDirectory(done) {
    var AnimeDirectory = require('./anime_directory');
    AnimeDirectory.generateModels(done);
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
    Mongoose.connection.collections.animes.drop(function (err) {
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

/**
 * Returns a promise of a search result
 * @param searchParams
 * @returns {*}
 */
AnimeSchema.statics.findPromise = function (searchParams) {
    return Q.denodeify(this.find.bind(this))(searchParams);
};

AnimeSchema.statics.syncDb = function (done) {
    readAnimeDirectory(function (err) {
        if (err) console.log(err);
        getSubGroups(function (subgroups) {
            var Subgroup = require('./subgroup');
            Subgroup.create(subgroups, function (err) {
                if (err) console.log(err);
                done(err, { status: 'SUCCESS', message: 'SUCCESS' });
            });
        });
    });
};


AnimeSchema.statics.readAnimeDirectory = readAnimeDirectory;
AnimeSchema.statics.flushAnimeCollection = flushCollection;

module.exports = Mongoose.model('Anime', AnimeSchema);
