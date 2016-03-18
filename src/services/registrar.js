/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";
const SocketHandler = require('./SocketHandler').SocketHandler;
const NotificationManager = require('./NotificationManager');
const PushBullet = require('./NotificationManager/PushBullet');
const TransmissionServer = require('./TransmissionServer');
const Redis = require('ioredis');

module.exports = (app, httpServer) => {

  // Declarations
  const appConfig = app.get('app_config');
  const notificationManager = new NotificationManager();
  const pushBullet = new PushBullet('app_config');
  const redis = new Redis(appConfig.redis);
  const socketHandler = new SocketHandler(httpServer);
  const transmissionServer = new TransmissionServer(redis);

  // Setup
  notificationManager.attachListener(pushBullet);

  // Registration
  app.set('notification_manager', notificationManager);
  app.set('redis', redis);
  app.set('socket_handler', socketHandler);
  app.set('torrentServer', transmissionServer);
};
