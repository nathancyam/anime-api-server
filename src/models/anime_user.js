const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const AnimeUserSchema = new Schema({
  user_id: Schema.ObjectId,
  anime_id: Schema.ObjectId,
  episodes: Array,
  is_complete: Boolean,
  is_watching: Boolean,
  subgroup: String,
});

module.exports = mongoose.model('AnimeUser', AnimeUserSchema);
