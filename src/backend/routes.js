/**
 * Created by nathan on 4/6/14.
 */

// HELPERS
var CacheHelper = require('./helpers/cache');

// CONTROLLERS
var MyAnimeListController = require('./controllers/mal'),
    AnimeController = require('./controllers/anime'),
    EpisodeController = require('./controllers/episode'),
    SubgroupController = require('./controllers/subgroup'),
    AnimeNewsNetworkController = require('./controllers/ann'),
    TorrentController = require('./controllers/torrents'),
    DanbooruController = require('./controllers/danbooru'),
    SettingsController = require('./controllers/settings');

module.exports = function (app) {
    // INDEX
    app.get('/', function (req, res) {
        res.render('index', { title: 'Anime Episode App' });
    });

    // ANIME ROUTES
    app.get('/anime', CacheHelper.getCacheResponse, AnimeController.list);
    app.get('/anime/search', AnimeController.search);
    app.get('/anime/update', AnimeController.update);
    app.post('/anime/update', AnimeController.updateConfig);
    app.get('/anime/image', AnimeController.imageTest);
    app.get('/anime/:id', AnimeController.findById);
    app.post('/anime', AnimeController.save);

    // EPISODE ROUTES
    app.get('/episodes', EpisodeController.list);
    app.get('/episodes/anime/:id', EpisodeController.getEpisodesByAnime);

    // SUBGROUP ROUTES
    app.get('/subgroups', SubgroupController.list);
    app.get('/subgroup/search', SubgroupController.search);

    // SYNC ROUTES
    app.get('/sync/anime', AnimeController.sync);
    app.get('/sync/subgroups', SubgroupController.sync);
    app.get('/sync/episodes', EpisodeController.sync);

    // SETTINGS ROUTES
    app.get('/settings', SettingsController.getSettings);
    app.post('/settings', SettingsController.setSettings);

    // MYANIMELIST ROUTES
    app.get('/mal/search', CacheHelper.getCacheResponse, MyAnimeListController.search);

    // ANIME NEWS NETWORK ROUTES
    app.get('/ann/search', CacheHelper.getCacheResponse, AnimeNewsNetworkController.search);

    // TORRENT ROUTES
    app.get('/nyaatorrents/search', TorrentController.search);
    app.post('/torrent/add', TorrentController.addTorrent);

    // DANBOORU ROUTES
    app.get('/danbooru/search', CacheHelper.getCacheResponse, DanbooruController.getImages);

    app.get('/test/process', TorrentController.startProcess);
};

