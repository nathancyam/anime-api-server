/**
 * Created by nathanyam on 21/07/2016.
 */

class AnimeUpdateCommand {

  /**
   * @param {Anime} animeRepository
   * @param {AutoUpdaterDirectorFactory} autoUpdater
   * @param {NyaaTorrentSearcher} nyaaTorrents
   * @param {TransmissionServer} torrentServer
   */
  constructor(animeRepository, autoUpdater, nyaaTorrents, torrentServer) {
    this.animeRepository = animeRepository;
    this.autoUpdater = autoUpdater;
    this.nyaaTorrents = nyaaTorrents;
    this.torrentServer = torrentServer;
  }

  static create(container) {
    return new AnimeUpdateCommand(
      container.get('anime'),
      container.get('auto_updater'),
      container.get('nyaatorrents'),
      container.get('torrent_server')
    );
  }

  /**
   * @param {Object} queryObj
   * @returns {Promise.<Object>}
   */
  execute(queryObj) {
    return this.animeRepository.find(queryObj)
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
