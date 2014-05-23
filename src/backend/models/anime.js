/*jslint node: true*/
"use strict";
var Mongoose = require('mongoose'),
    Schema = Mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Cache = require('../modules/cache'),
    Gridfs = require('gridfs-stream'),
    Q = require('q'),
    FS = require('fs'),
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

/**
 * Saves an image to an image given a file path
 * @param image
 * @param callback
 */
AnimeSchema.methods.setPicture = function (image, callback) {
    var self = this;
    var conn = Mongoose.createConnection('mongodb://localhost/anime:27017');

    conn.once('open', function () {
        var gfs = new Gridfs(conn.db, Mongoose.mongo);
        var writeStream = gfs.createWriteStream({
            filename: 'flsjfld' + image.split('/').pop(),
            collection: 'animes',
            metadata: {
                anime: self.id
            }
        });
        FS.createReadStream(image).pipe(writeStream);
        writeStream.on('close', function (file) {
            callback(null, file);
        });
    });
};

AnimeSchema.methods.getPicture = function (callback) {
    var conn = Mongoose.createConnection('mongodb://localhost/anime:27017');

    conn.once('open', function () {
        var gfs = new Gridfs(conn.db, Mongoose.mongo);
        var writeStream = FS.createWriteStream('/tmp/45.jpg');
        var readStream = gfs.createReadStream({
            filename: 'flsjfldtest.jpg'
        });
        readStream.pipe(writeStream);
        writeStream.on('close', function () {
            callback(null, '/tmp/45.jpg');
        });
    });
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
