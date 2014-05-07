/**
 * Module dependencies.
 */

var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    config = require('./config'),
    Settings = require('./models/settings');

var app = express();
mongoose.connect('mongodb://localhost/anime:27017');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser());
app.use(express.static(__dirname + '/../public'));

// Set routes
require("./routes")(app);

// Initialise the settings
Settings.init(config);

// Ready for requests!
app.listen(app.get('port'));
