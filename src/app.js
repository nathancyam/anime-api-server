/**
 * Module dependencies.
 */

var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    mongoose = require('mongoose'),
    config = require('./config'),
    Settings = require('./models/settings'),
    app = express(),
    server = app.listen(3000);

mongoose.connect('mongodb://localhost/anime:27017');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser());
app.use(express.static(__dirname + '/../public'));

// Initialise the settings
Settings.init(config);

// Set routes
require("./routes")(app);

// Set the socket handler
require("./modules/socket_handler")(server);

