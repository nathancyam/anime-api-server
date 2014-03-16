
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./controllers');
var user = require('./controllers/user');
var cart = require('./controllers/cart');
var mal = require('./controllers/mal');
var config = require('./config');
var product = require('./controllers/product');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// === ROUTES ===
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/cart', cart.index);

app.get('/config', routes.products);
app.get('/gallery', routes.gallery);
app.get('/anime', routes.getanime);
app.get('/malsearch', mal.search);

app.get('/products', product.list);
app.post('/cart/add', cart.add);
app.delete('/cart/:id', cart.remove);
app.post('/checkout', cart.checkout);

// === SERVER ===
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
