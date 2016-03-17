const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config');
const cookieParser = require('cookie-parser');
const Settings = require('./modules/settings');
const app = express();
const httpServer = module.exports = require('http').createServer(app);
const NotificationManager = require('./services/NotificationManager');
const PushBullet = require('./services/NotificationManager/PushBullet');

mongoose.connect(config.mongo);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(__dirname + '/../../public'));

// Initialise the settings
Settings.init(config);

// Set routes
console.log('Initialising URI routes...');
require("./routes")(app);

// Set the socket handler
console.log('Initialising socket handler...');
var SocketHandler = require('./services/SocketHandler').SocketHandler;
const socketHandler = new SocketHandler(httpServer);
app.set('socket_handler', socketHandler);

console.log('Initialising notification manager...');
const notificationManager = new NotificationManager();
const pushBullet = new PushBullet(config);
notificationManager.attachListener(pushBullet);
app.set('notification_manager', notificationManager);

// Start the regular checker
console.log('Initialising process handlers and child process...');
var ProcessHandler = require('./modules/anime_updater_process_handler');
var processHandler = new ProcessHandler();
processHandler.startProcess();

httpServer.listen(app.get('port'), function () {
  console.log('Server ready for requests on port: ' + app.get('port'));
});

process.on('SIGTERM', function() {
  console.log("Terminating server...");
  httpServer.close(function() {

  });
  console.log("Server terminated");
  process.exit();
});

