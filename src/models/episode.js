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
        helper.createEpisodeModels(done);
    });
};

module.exports = Mongoose.model('Episode', EpisodeSchema);

