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

var ANN_IMAGE_DIR = require('../config').image_dir,
    PUBLIC_DIR = '/media/images';

var AnimeSchema = new Schema({
    designated_subgroup: String,
    title: String,
    normalizedName: String,
    episodes: ObjectId,
    filepath: String,
    filenames: Array,
    ann_id: Number,
    image_url: String,
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

/**
 * @returns {AnimeSchema.methods}
 */
AnimeSchema.methods.setLowerCase = function () {
    this.normalizedName = this.title.replace(/\W/g, '').toLowerCase();
    return this;
};

/**
 * @param name
 * @returns {string}
 */
AnimeSchema.statics.getNormalizedName = (name) => {
    return name.replace(/\W/g, '').toLowerCase();
};

/**
 * Returns a promise of a search result
 * @param searchParams
 * @returns {*}
 */
AnimeSchema.statics.findPromise = function (searchParams) {
    return Q.denodeify(this.find.bind(this))(searchParams);
};

AnimeSchema.statics.promisify = (method) => {
    return methodArgs => {
        return new Promise((resolve, reject) => {
            method(methodArgs, (err, result) => {
                if (err) {
                  console.error(err);
                  return reject(err);
                }
                return resolve(result);
            });
        })
    };
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

/**
 * Gets the image URL that contain the normalised name for the anime
 * @param callback Callback that contains the params (err, imageFilePath)
 */
AnimeSchema.methods.getPictureUrl = function (callback) {
    var self = this;

    if (self.image_url) {
        return callback(null, self.image_url);
    }

    var readDir = Q.denodeify(FS.readdir);
    readDir(ANN_IMAGE_DIR).then(function (files) {
        if (files.length === 0) {
            return callback(null);
        }
        var imageFileName =
            files.filter(
                function (e) {
                    return e.indexOf(self.normalizedName) !== -1;
                }
            ).pop();

        if (!self.image_url && imageFileName) {
            self.image_url = PUBLIC_DIR + '/' + imageFileName;
            self.save(function () {
                return callback(null, PUBLIC_DIR + '/' + imageFileName);
            });
        } else {
            return callback(null, PUBLIC_DIR + '/' + imageFileName);
        }
    }, function (err) {
        callback(err, null);
    });
};

/**
 * Reads the anime file directory on the harddrive and saves the files onto the database.
 * @param done Callback when the synchronisation process finishes
 */
AnimeSchema.statics.syncDb = function (done) {
    readAnimeDirectory(function (err) {
        if (err) console.log(err);
        getSubGroups(function (subgroups) {
            var Subgroup = require('./subgroup');
            Subgroup.create(subgroups, function (err) {
                if (err) {
                    done(err, null);
                } else {
                    done(err, { status: 'SUCCESS', message: 'Successfully synchronised with anime file directory' });
                }
            });
        });
    });
};


AnimeSchema.statics.readAnimeDirectory = readAnimeDirectory;
AnimeSchema.statics.flushAnimeCollection = flushCollection;

/**
 * @constructor
 * @type {exports}
 */
var Anime = module.exports = Mongoose.model('Anime', AnimeSchema);
