/**
 * Module dependencies.
 */

var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    mongoose = require('mongoose'),
    config = require('./config'),
    cookieParser = require('cookie-parser'),
    Settings = require('./modules/settings'),
    Db = require('./db/setup'),
    app = express(),
    server = module.exports = app.listen(3000);

mongoose.connect(config.mongo);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser());
app.use(cookieParser());
app.use(express.static(__dirname + '/../../public'));

// Initialise the settings
Settings.init(config);

// Set routes
require("./routes")(app);

// Set the socket handler
var socketHandler = require('./modules/socket_handler');
socketHandler.setServer(server);
socketHandler.initConnection();

// Set the file watcher
var fileWatcher = require('./modules/file_watcher');
fileWatcher.setOptions({ watchDir: config.watch_dir });
fileWatcher.watchDir();

process.on('SIGTERM', function() {
    console.log("Terminating server...");
    server.close(function() {

    });
    console.log("Server terminated");
    process.exit();
});

