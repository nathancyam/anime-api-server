/**
 * Created by nathan on 4/6/14.
 */

var routes = require('./controllers');
var user = require('./controllers/user');
var CartController = require('./controllers/cart');

var MyAnimeListController = require('./controllers/mal'),
    AnimeController = require('./controllers/anime'),
    EpisodeController = require('./controllers/episode'),
    SubgroupController = require('./controllers/subgroup'),
    AnimeNewsNetworkController = require('./controllers/ann'),
    ProductController = require('./controllers/product');

module.exports = function (app) {
    app.get('/', routes.index);
    app.get('/users', user.list);
    app.get('/cart', CartController.index);

    app.get('/config', routes.products);
    app.get('/gallery', routes.gallery);

    // ANIME ROUTES
    app.get('/anime', AnimeController.list);
    app.get('/anime/sync', AnimeController.sync);
    app.get('/anime/search', AnimeController.findByName);
    app.get('/geteps', AnimeController.createEps);

    // MYANIMELIST ROUTES
    app.get('/mal/search', MyAnimeListController.search);

    // ANIME NEWS NETWORK ROUTES
    app.get('/ann/search', AnimeNewsNetworkController.search);
    app.get('/ann/:id', AnimeNewsNetworkController.searchById);

    // EPISODE ROUTES
    app.get('/episodes', EpisodeController.list);
    app.get('/episodes/sync', EpisodeController.sync);
    app.get('/episodes/anime/:id', EpisodeController.getEpisodesByAnime);

    // SUBGROUP ROUTES
    app.get('/subgroups', SubgroupController.list);

    app.get('/products', ProductController.list);
    app.post('/cart/add', CartController.add);
    app.delete('/cart/:id', CartController.remove);
    app.post('/checkout', CartController.checkout);
};

