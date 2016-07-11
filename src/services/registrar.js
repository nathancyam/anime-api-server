/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";
const SocketHandler = require('./SocketHandler').SocketHandler;
const NotificationManager = require('./NotificationManager');
const PushBullet = require('./NotificationManager/PushBullet');
const TransmissionServer = require('./TransmissionServer');
const Redis = require('./Redis');
const TorrentChannel = require('./Redis/TorrentChannel');
const NyaaTorrentSearcher = require('./NyaaTorrentSearcher');

const { Searcher, NameSearcher, IdSearcher } = require('./AnimeNewsNetwork');
const AnnImageHandler = require('./AnimeNewsNetwork/image');
const GoogleHelper = require('./AnimeNewsNetwork/google');
const ParserFactory = require('./AnimeNewsNetwork/parser');

// Factory definitions
const AutoUpdaterServiceFactory = require('./AutoUpdater');
const EpisodeUpdaterFactory = require('./EpisodeUpdater');

module.exports = (app, httpServer) => {

  // Declarations
  const appConfig = app.get('app_config');
  const notificationManager = new NotificationManager();
  const pushBullet = new PushBullet(appConfig);
  const redisSub = new Redis.RedisSubscriber(appConfig.redis);
  const redisConn = new Redis.RedisConnection(appConfig.redis);
  const socketHandler = new SocketHandler(httpServer);
  const torrentChannel = new TorrentChannel(redisSub);
  const transmissionServer = new TransmissionServer(torrentChannel);
  const nyaaTorrentSearcher = new NyaaTorrentSearcher();

  const _imageHandler = new AnnImageHandler(appConfig.image_dir);
  const _idSearcher = new IdSearcher(ParserFactory.createWithParsers());
  const _googleHelper = new GoogleHelper.RedisGoogleSearch(
    redisConn,
    new GoogleHelper.GoogleSearch(appConfig.google)
  );
  const _nameSearcher = new NameSearcher(
    _idSearcher,
    _googleHelper,
    ParserFactory.create()
  );

  const annSearcher = new Searcher(_nameSearcher, _idSearcher, _imageHandler);

  // Setup
  notificationManager.attachListener(pushBullet);
  require('./Auth')(app, appConfig);

  // Registration
  app.set('notification_manager', notificationManager);
  app.set('redis', redisSub);
  app.set('socket_handler', socketHandler);
  app.set('torrent_server', transmissionServer);
  app.set('nyaatorrents', nyaaTorrentSearcher);
  app.set('ann_searcher', annSearcher);

  app.set('auto_updater', new AutoUpdaterServiceFactory(
    new EpisodeUpdaterFactory(),
    app.getModel('episode')
  ));
};
