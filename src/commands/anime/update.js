/**
 * Created by nathanyam on 21/07/2016.
 */

class AnimeUpdateCommand {

  /**
   * @param {Anime} animeRepository
   * @param {AutoUpdaterDirectorFactory} autoUpdater
   * @param {NyaaTorrentSearcher} nyaaTorrents
   * @param {TransmissionServer} torrentServer
   * @param queryObj
   */
  constructor(animeRepository, autoUpdater, nyaaTorrents, torrentServer, queryObj) {
    this.animeRepository = animeRepository;
    this.autoUpdater = autoUpdater;
    this.nyaaTorrents = nyaaTorrents;
    this.torrentServer = torrentServer;
    this.queryObj = queryObj;
  }

  /**
   * @param {{ get(): Function }} container
   * @param {Object} queryObj
   * @returns {AnimeUpdateCommand}
   */
  static create(container, queryObj) {
    return new AnimeUpdateCommand(
      container.get('anime'),
      container.get('auto_updater'),
      container.get('nyaatorrents'),
      container.get('torrent_server'),
      queryObj
    );
  }

  /**
   * @returns {Promise.<Object>}
   */
  execute() {
    return this.animeRepository.find(this.queryObj)
      .then(animeCollection => {
        const updaters = this.autoUpdater.createCollection(
          animeCollection,
          this.nyaaTorrents,
          this.torrentServer
        );

        return Promise.all(updaters.map(updater => updater.postTorrentsToServer()));
      })
  }
}

module.exports = AnimeUpdateCommand;
