/**
 * Created by nathan on 3/20/14.
 */

var Mongoose = require('mongoose'),
    Schema = Mongoose.Schema;

var EpisodeSchema = new Schema({
    subgroup: String,
    number: Number,
    filePath: String,
    isAnime: Boolean
});

EpisodeSchema.statics.checkAnime = function () {
    this.isAnime = this.filePath.split('.').pop() === 'mkv' && this.filePath.match(/\[(.*?)]/gi) !== undefined;
};

module.exports = Mongoose.model('EpisodeSchema', EpisodeSchema);

