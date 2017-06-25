/**
 * Created by nathan on 4/6/14.
 */

const SettingsController = require('./controllers/settings');
const NotificationController = require('./controllers/notification');

const AnimeRouter = require('./controllers/anime');
const EpisodeRouter = require('./controllers/episode');
const AuthRouter = require('./services/Auth/router');
const UserRouter = require('./controllers/user');
const TorrentRouter = require('./controllers/torrents');
const NyaaTorrentRouter = require('./controllers/nyaatorrents');
const TokyoToshoRouter = require('./controllers/tokyotosho');
const AnimeNewsNetworkRouter = require('./controllers/ann');
const authMiddleware = require('./controllers/middleware/auth').loggedInMiddleware;

module.exports = (app) => {
  app.get('/logout', (req, res) => {
    req.logout();
    return res.json({ status: 'success' });
  });

  app.use('/auth', AuthRouter(app));
  app.use('/user', authMiddleware, UserRouter);
  app.use('/anime', authMiddleware, AnimeRouter);
  app.use('/episodes', authMiddleware, EpisodeRouter);
  app.use('/torrent', TorrentRouter);
  app.use('/nyaatorrents', authMiddleware, NyaaTorrentRouter);
  app.use('/tokyotosho', authMiddleware, TokyoToshoRouter);
  app.use('/ann', AnimeNewsNetworkRouter);

  // NOTIFICATION ROUTES
  app.get('/notifications', NotificationController.list);

  // SETTINGS ROUTES
  app.get('/settings', authMiddleware, SettingsController.getSettings);
  app.post('/settings', authMiddleware, SettingsController.setSettings);
};

