/**
 * Created by nathan on 3/20/14.
 */

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var ObjectId = Schema.ObjectId;

var EpisodeSchema = new Schema({
    anime: ObjectId,
    number: Number,
    filePath: String,
    isAnime: Boolean
});

module.exports = Mongoose.model('Episode', EpisodeSchema);

