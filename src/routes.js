/**
 * Created by nathan on 4/6/14.
 */

var routes = require('./controllers'),
    CacheHelper = require('./helpers/cache');

// CONTROLLERS
var MyAnimeListController = require('./controllers/mal'),
    AnimeController = require('./controllers/anime'),
    EpisodeController = require('./controllers/episode'),
    SubgroupController = require('./controllers/subgroup'),
    AnimeNewsNetworkController = require('./controllers/ann');

module.exports = function (app) {
    // INDEX
    app.get('/', routes.index);

    // ANIME ROUTES
    app.get('/anime', CacheHelper.getCacheResponse, AnimeController.list);
    app.get('/anime/search', AnimeController.findByName);
    app.get('/geteps', AnimeController.createEps);

    // MYANIMELIST ROUTES
    app.get('/mal/search', CacheHelper.getCacheResponse, MyAnimeListController.search);

    // ANIME NEWS NETWORK ROUTES
    app.get('/ann/search', CacheHelper.getCacheResponse, AnimeNewsNetworkController.search);
    app.get('/ann/:id', CacheHelper.getCacheResponse, AnimeNewsNetworkController.searchById);

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
};

