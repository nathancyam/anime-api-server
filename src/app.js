
/**
 * Module dependencies.
 */

var express = require('express');
var config = require('./config');
var Cache = require('./models/cache');
var http = require('http');
var path = require('path');

var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/anime:27017');

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
app.use(express.static(path.join(__dirname, '../public')));

app.use(function(req, res, next) {
    if (Cache.has(req.url)) {
        res.send(Cache.get(req.url));
    } else {
        next();
    }
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

require("./routes")(app);

// === SERVER ===
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
