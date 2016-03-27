'use strict';

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.set('console', (message, type) => {
  type = type || 'log';
  if (process.env.NODE_ENV === 'development') {
    console[type](message);
  }
});

app.get('console')('Setting app configuration');
app.set('app_config', require('./config'));

require('./bootstrap')(app, httpServer);

// Start the regular checker
app.get('console')('Initialising process handlers and child process...');
var ProcessHandler = require('./modules/anime_updater_process_handler');
var processHandler = new ProcessHandler();
processHandler.startProcess();

httpServer.listen(app.get('port'), function () {
  app.get('console')('Server ready for requests on port: ' + app.get('port'));
});

process.on('SIGTERM', function() {
  console.log("Terminating server...");
  httpServer.close(function() {

  });
  console.log("Server terminated");
  process.exit();
});

module.exports = app;
