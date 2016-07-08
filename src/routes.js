/**
 * Created by nathan on 4/6/14.
 */

// HELPERS
var CacheHelper = require('./helpers/cache');
var path = require('path');

// CONTROLLERS
const SubgroupController = require('./controllers/subgroup');
const DanbooruController = require('./controllers/danbooru');
const SettingsController = require('./controllers/settings');
const NotificationController = require('./controllers/notification');

const AnimeRouter = require('./controllers/anime');
const EpisodeRouter = require('./controllers/episode');
const AuthRouter = require('./services/Auth/router');
const UserRouter = require('./controllers/user');
const TorrentRouter = require('./controllers/torrents');
const NyaaTorrentRouter = require('./controllers/nyaatorrents');
const AnimeNewsNetworkRouter = require('./controllers/ann');

module.exports = (app) => {
  app.get('/logout', (req, res) => {
    req.logout();
    return res.json({ status: 'success' });
  });
  
  app.use('/auth', AuthRouter(app));
  app.use('/user', UserRouter);
  app.use('/anime', AnimeRouter);
  app.use('/episodes', EpisodeRouter);
  app.use('/torrent', TorrentRouter);
  app.use('/nyaatorrents', NyaaTorrentRouter);
  app.use('/ann', AnimeNewsNetworkRouter);

  // SUBGROUP ROUTES
  app.get('/subgroups', SubgroupController.list);
  app.get('/subgroup/search', SubgroupController.search);

  // NOTIFICATION ROUTES
  app.get('/notifications', NotificationController.list);

  // SETTINGS ROUTES
  app.get('/settings', SettingsController.getSettings);
  app.post('/settings', SettingsController.setSettings);

  // DANBOORU ROUTES
  app.get('/danbooru/search', CacheHelper.getCacheResponse, DanbooruController.getImages);
};

