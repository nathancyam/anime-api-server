/**
 * Created by nathan on 4/6/14.
 */

// HELPERS
var CacheHelper = require('./helpers/cache');
var path = require('path');

// CONTROLLERS
var AnimeController = require('./controllers/anime'),
  AnimeUpdateController = require('./controllers/updater');
  EpisodeController = require('./controllers/episode'),
  SubgroupController = require('./controllers/subgroup'),
  AnimeNewsNetworkController = require('./controllers/ann'),
  TorrentController = require('./controllers/torrents'),
  DanbooruController = require('./controllers/danbooru'),
  SettingsController = require('./controllers/settings'),
  NotificationController = require('./controllers/notification');

module.exports = function (app) {

  app.post('/login', (req, res) => {
    console.log(req.body);
    return res.json({ status: 'success' });
  });

  app.get('/logout', (req, res) => {
    return res.json({ status: 'success' });
  });

  // ANIME ROUTES
  app.get('/anime', CacheHelper.getCacheResponse, AnimeController.list);
  app.get('/anime/search', AnimeController.search);
  app.get('/anime/update', AnimeUpdateController.update);
  app.post('/anime/update', AnimeController.updateConfig);
  app.get('/anime/image/:id', AnimeController.getImage);
  app.post('/anime/image/:id', AnimeController.setImage);
  app.get('/anime/:id', AnimeController.findById);
  app.post('/anime', AnimeController.save);

  // EPISODE ROUTES
  app.get('/episodes', EpisodeController.list);
  app.get('/episodes/anime/:id', EpisodeController.getEpisodesByAnime);

  // SUBGROUP ROUTES
  app.get('/subgroups', SubgroupController.list);
  app.get('/subgroup/search', SubgroupController.search);

  // NOTIFICATION ROUTES
  app.get('/notifications', NotificationController.list);

  // SYNC ROUTES
  app.get('/sync/anime', AnimeController.sync);
  app.get('/sync/subgroups', SubgroupController.sync);
  app.get('/sync/episodes', EpisodeController.sync);

  // SETTINGS ROUTES
  app.get('/settings', SettingsController.getSettings);
  app.post('/settings', SettingsController.setSettings);

  // ANIME NEWS NETWORK ROUTES
  app.get('/ann/search', CacheHelper.getCacheResponse, AnimeNewsNetworkController.search);
  app.get('/ann/search/all', CacheHelper.getCacheResponse, AnimeNewsNetworkController.getListing);

  // TORRENT ROUTES
  app.get('/nyaatorrents/search', TorrentController.search);
  app.post('/torrent/add', TorrentController.addTorrent);

  // DANBOORU ROUTES
  app.get('/danbooru/search', CacheHelper.getCacheResponse, DanbooruController.getImages);
};

