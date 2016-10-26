/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const path = require('path');

// Models
const AnimeModel = require('./models/anime');
const EpisodeModel = require('./models/episode');
const NotificationModel = require('./models/subgroup');
const DirectoryModel = require('./models/anime_directory');
const UserModel = require('./models/user');

// Helpers
const ApiParserHelper = require('./helpers/api_parsers');
const CacheHelper = require('./helpers/cache');
const EpisodeHelper = require('./helpers/episode');
const GoogleHelper = require('./helpers/google');
const TorrentHelper = require('./helpers/torrents');

const models = {
  'anime': AnimeModel,
  'episode': EpisodeModel,
  'notification': NotificationModel,
  'anime_directory': DirectoryModel,
  'user': UserModel
};

const helpers = {
  'api_parsers': ApiParserHelper,
  'cache': CacheHelper,
  'episode': EpisodeHelper,
  'google': GoogleHelper,
  'torrent': TorrentHelper
};

/**
 * @param {Object} obj
 * @param {String} type
 * @param {String} alias
 * @returns {Object|Function}
 */
const resolver = (obj, type, alias) => {
  const moduleDef = obj[alias];
  if (typeof moduleDef === 'undefined') {
    throw new Error(`${type} ${alias} not specified.`);
  }
  return moduleDef;
};

module.exports = (app, httpServer) => {
  app.get('console')('Binding model helpers...');
  mongoose.connect(app.get('app_config').mongo);

  app.getModel = resolver.bind(null, models, 'Model');
  app.getHelper = resolver.bind(null, helpers, 'Helper');

  app.get('console')('Binding services...');
  require('./services/registrar')(app, httpServer);

  app.get('console')('Parsing routes...');
  require('./routes')(app);
};
