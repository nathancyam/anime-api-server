/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose');

var config = require('./config'),
    Settings = require('./models/settings');

var app = express();

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

app.configure('development', function () {
    app.use(express.errorHandler());
});

require("./routes")(app);

// === SERVER ===
http.createServer(app).listen(app.get('port'), function () {
    console.log('Initialising settings...');
    Settings.init(config);
    console.log('Express server listening on port ' + app.get('port'));
});
