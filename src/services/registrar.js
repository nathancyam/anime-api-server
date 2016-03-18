/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";
const SocketHandler = require('./SocketHandler').SocketHandler;
const NotificationManager = require('./NotificationManager');
const PushBullet = require('./NotificationManager/PushBullet');
const TransmissionServer = require('./TransmissionServer');
const RedisConnector = require('./Redis');
const TorrentChannel = require('./Redis/TorrentChannel');

module.exports = (app, httpServer) => {

  // Declarations
  const appConfig = app.get('app_config');
  const notificationManager = new NotificationManager();
  const pushBullet = new PushBullet('app_config');
  const redis = new RedisConnector(appConfig.redis);
  const socketHandler = new SocketHandler(httpServer);
  const torrentChannel = new TorrentChannel(redis);
  const transmissionServer = new TransmissionServer(torrentChannel);

  // Setup
  notificationManager.attachListener(pushBullet);

  // Registration
  app.set('notification_manager', notificationManager);
  app.set('redis', redis);
  app.set('socket_handler', socketHandler);
  app.set('torrent_server', transmissionServer);
};