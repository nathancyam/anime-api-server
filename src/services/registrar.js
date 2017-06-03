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
const TokyoTosho = require('./TokyoTosho');

const { Searcher, NameSearcher, IdSearcher } = require('./AnimeNewsNetwork');
const AnnImageHandler = require('./AnimeNewsNetwork/image');
const GoogleHelper = require('./AnimeNewsNetwork/google');
const ParserFactory = require('./AnimeNewsNetwork/parser');

// Factory definitions
const AutoUpdaterServiceFactory = require('./AutoUpdater');
const EpisodeUpdaterFactory = require('./EpisodeUpdater');
const CommandFactory = require('./CommandFactory').CommandFactory;
const CommandBus = require('./CommandFactory').CommandBus;

module.exports = (app, httpServer) => {

  // Declarations
  const appConfig = app.get('app_config');

  const notificationManager = new NotificationManager();
  const pushBullet = new PushBullet(appConfig);
  notificationManager.attachListener(pushBullet);

  const nyaaTorrentSearcher = new NyaaTorrentSearcher();
  const redisSub = new Redis.RedisSubscriber(appConfig.redis);
  const redisConn = new Redis.RedisConnection(appConfig.redis);
  const socketHandler = new SocketHandler(httpServer);
  const torrentChannel = new TorrentChannel(socketHandler, notificationManager);
  const transmissionServer = new TransmissionServer(torrentChannel);
  const animeEntity = app.getModel('anime');
  const episodeEntity = app.getModel('episode');


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

  const tokyoTosho = new TokyoTosho();

  const annSearcher = new Searcher(_nameSearcher, _idSearcher, _imageHandler);

  const autoUpdater = new AutoUpdaterServiceFactory(
    new EpisodeUpdaterFactory(),
    episodeEntity
  );

  // Setup
  require('./Auth')(app, appConfig);

  // const commandBus = new CommandBus([
  //   function* (cmd, next) {
  //     console.log('start a');
  //     yield next(cmd);
  //     console.log('end a');
  //   },
  //   function* (cmd, next) {
  //     console.log('start b');
  //     yield next(cmd);
  //     console.log('end b');
  //   }
  // ]);

  const commandBus = new CommandBus([]);


  // Registration
  const container = {
    anime: animeEntity,
    auto_updater: autoUpdater,
    ann_searcher: annSearcher,
    ann_google_searcher: _googleHelper,
    notification_manager: notificationManager,
    nyaatorrents: nyaaTorrentSearcher,
    redis: redisSub,
    socket_handler: socketHandler,
    torrent_server: transmissionServer,
    command_bus: commandBus,
    tokyo_tosho: tokyoTosho,
  };

  const containerHandler = {

    /**
     * @param {String} alias
     * @returns {Object}
     */
    get(alias) {
      if (!Object.keys(container).includes(alias)) {
        throw new Error(`Dependency alias '${alias}' not defined.`);
      }

      return container[alias];
    },

    /**
     * @param {String} helperAlias
     * @returns {Object}
     */
    helper(helperAlias) {
      return app.getHelper(helperAlias);
    }
  };

  const commandManager = new CommandFactory(containerHandler);

  app.set('command', commandManager);
  app.set('bus', commandBus);
  Object.keys(container)
    .forEach(alias => app.set(alias, container[alias]));
};
