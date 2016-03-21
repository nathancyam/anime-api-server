'use strict';

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const httpServer = module.exports = require('http').createServer(app);
const NotificationManager = require('./services/NotificationManager');
const PushBullet = require('./services/NotificationManager/PushBullet');

// all environments
app.use(express.static(__dirname + '/../../public'));
app.set('port', process.env.PORT || 3000);
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded());
app.use(session({ secret: 'secret' }));
app.use(passport.initialize());
app.use(passport.session())

console.log('Setting app configuration...');
app.set('app_config', require('./config'));

console.log('Starting bootstrap process...');
require('./bootstrap')(app, httpServer);

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

