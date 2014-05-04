/**
 * Created by nathan on 3/20/14.
 */

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Cache = require('./cache');

var EpisodeSchema = new Schema({
    anime: ObjectId,
    number: Number,
    filePath: String,
    fileName: String,
    subGroup: ObjectId,
    isAnime: Boolean
});

EpisodeSchema.statics.flushCollection = function (done) {
    Mongoose.connection.collections['episodes'].drop(function (err) {
        if (err) {
            console.log(err);
        }
        Cache.flush();
        done();
    });
};

EpisodeSchema.statics.sync = function (done) {
    var helper = require('../helpers/episode');
    this.flushCollection(function () {
        helper.createEpisodeModels(function (err, result) {
            if (err) {
                done(err, null);
            } else {
                done(null, result);
            }
        });
    });
};

/**
 * Set the episode number using regex on the episode filename
 */
EpisodeSchema.methods.getEpisodeNumber = function () {
    var episodeFilename = this.filePath.split('/').pop(),
        results = episodeFilename.match(/\d{2}/i);

    if (results !== undefined && results !== null) {
        var epNumber = parseInt(results.shift());
        if (epNumber < 30) this.number = epNumber;
    }
};

EpisodeSchema.pre('save', function (next) {
    if (this.isAnime) {
        this.fileName = this.filePath.split("/").pop();
        this.getEpisodeNumber();
    }
    next();
});

module.exports = Mongoose.model('Episode', EpisodeSchema);

