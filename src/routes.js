/**
 * Created by nathan on 4/6/14.
 */

var routes = require('./controllers');
var user = require('./controllers/user');
var CartController = require('./controllers/cart');

var MyAnimeListController = require('./controllers/mal'),
    AnimeController = require('./controllers/anime'),
    ProductController = require('./controllers/product');

module.exports = function (app) {
    app.get('/', routes.index);
    app.get('/users', user.list);
    app.get('/cart', CartController.index);

    app.get('/config', routes.products);
    app.get('/gallery', routes.gallery);

    // ANIME ROUTES
    app.get('/anime', AnimeController.list);
    app.get('/malsearch', MyAnimeListController.search);

    app.get('/products', ProductController.list);
    app.post('/cart/add', CartController.add);
    app.delete('/cart/:id', CartController.remove);
    app.post('/checkout', CartController.checkout);
};

