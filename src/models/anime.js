/*jslint node: true*/
"use strict";
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Q = require('q');
const FS = require('fs');
const Episode = require('./episode');
Mongoose.Promise = global.Promise;

const ANN_IMAGE_DIR = require('../config').image_dir;
const PUBLIC_DIR = '/media/images';

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
 * Gets the image URL that contain the normalised name for the anime
 * @param callback Callback that contains the params (err, imageFilePath)
 */
AnimeSchema.methods.getPictureUrl = function (callback) {
  if (this.image_url) {
    return callback(null, this.image_url);
  }

  var readDir = Q.denodeify(FS.readdir);

  readDir(ANN_IMAGE_DIR)
    .then(files => {
      if (files.length === 0) {
        return callback(null);
      }

      var imageFileName = files.filter(e => e.indexOf(self.normalizedName) !== -1).pop();

      if (!this.image_url && imageFileName) {
        this.image_url = PUBLIC_DIR + '/' + imageFileName;
        this.save(() => {
          return callback(null, PUBLIC_DIR + '/' + imageFileName);
        });
      } else {
        return callback(null, PUBLIC_DIR + '/' + imageFileName);
      }
    })
    .catch(err => {
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
module.exports = Mongoose.model('Anime', AnimeSchema);
