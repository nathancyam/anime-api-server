/**
 * Created by nathan on 4/6/14.
 */

// HELPERS
var CacheHelper = require('./helpers/cache');
var path = require('path');

// CONTROLLERS
const SubgroupController = require('./controllers/subgroup');
const AnimeNewsNetworkController = require('./controllers/ann');
const TorrentController = require('./controllers/torrents');
const DanbooruController = require('./controllers/danbooru');
const SettingsController = require('./controllers/settings');
const NotificationController = require('./controllers/notification');

const AnimeRouter = require('./controllers/anime');
const EpisodeRouter = require('./controllers/episode');
const AnilistProviderRouter = require('./services/AnilistProvider/router');
const UserRouter = require('./controllers/user');

module.exports = function (app) {

  app.post('/login', (req, res) => {
    console.log(req.body);
    return res.json({ status: 'success' });
  });

  app.get('/logout', (req, res) => {
    return res.json({ status: 'success' });
  });
  
  app.use('/auth', AnilistProviderRouter);
  app.use('/user', UserRouter);
  app.use('/anime', AnimeRouter);
  app.use('/episodes', EpisodeRouter);

  // SUBGROUP ROUTES
  app.get('/subgroups', SubgroupController.list);
  app.get('/subgroup/search', SubgroupController.search);

  // NOTIFICATION ROUTES
  app.get('/notifications', NotificationController.list);

  // SETTINGS ROUTES
  app.get('/settings', SettingsController.getSettings);
  app.post('/settings', SettingsController.setSettings);

  // ANIME NEWS NETWORK ROUTES
  app.get('/ann/search', CacheHelper.getCacheResponse, AnimeNewsNetworkController.search);
  app.get('/ann/search/all', CacheHelper.getCacheResponse, AnimeNewsNetworkController.getListing);

  // TORRENT ROUTES
  app.get('/nyaatorrents/search', TorrentController.search);
  app.post('/torrent/add', TorrentController.addTorrent);
  app.post('/torrent/server', TorrentController.updateTorrentServerDetails);

  // DANBOORU ROUTES
  app.get('/danbooru/search', CacheHelper.getCacheResponse, DanbooruController.getImages);
};

