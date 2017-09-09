/**
 * Created by nathanyam on 21/07/2016.
 */

const wait = (time) => new Promise(resolve => setTimeout(() => resolve(), time));

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
   * @param {AutoUpdaterDirector[]} updates
   * @return {Promise.<*>}
   */
  async staggerRequests(updates) {
    if (updates.length === 0) {
      return await true;
    }

    const [first, ...tail] = updates;
    await first.postTorrentsToServer();
    await wait(1000 * 60 * 2);
    return await this.staggerRequests(tail);
  }

  /**
   * @returns {Promise.<Object>}
   */
  async execute() {
    console.log(`${Date.now()} [Auto Update] Running automated update.`);
    const animeCollection = await this.animeRepository.find(this.queryObj);
    const updaters = this.autoUpdater.createCollection(
      animeCollection,
      this.nyaaTorrents,
      this.torrentServer
    );

    return await this.staggerRequests(updaters);
  }
}

module.exports = AnimeUpdateCommand;
