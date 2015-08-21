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
    app = express(),
    httpServer = module.exports = require('http').createServer(app),
    faye = require('faye');

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
console.log('Initialising URI routes...');
require("./routes")(app);

console.log('Starting Bayeux server');
var bayeux = new faye.NodeAdapter({ mount: '/faye', timeout: 45 });
app.set('bayeux', bayeux);
bayeux.attach(httpServer);

// Set the socket handler
console.log('Initialising socket handler...');
var socketHandler = require('./modules/socket_handler');
socketHandler.setServer(httpServer);
socketHandler.initConnection();

// Set the file watcher
console.log('Initialising filesystem watchers...');
var fileWatcher = require('./modules/file_watcher');
fileWatcher.setOptions({ watchDir: config.watch_dir });
fileWatcher.watchDir();

// Start the regular checker
console.log('Initialising process handlers and child process...');
var ProcessHandler = require('./modules/anime_updater_process_handler');
var processHandler = new ProcessHandler();
processHandler.startProcess();

httpServer.listen(app.get('port'), function () {
    console.log('Server ready for requests on port: ' + app.get('port'));
});

setInterval(function () {
    bayeux.getClient().publish('/test', {
        data: "test"
    });
}, 5000);

process.on('SIGTERM', function() {
    console.log("Terminating server...");
    httpServer.close(function() {

    });
    console.log("Server terminated");
    process.exit();
});

