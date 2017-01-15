/**
 * Created by nathanyam on 10/03/2016.
 */

"use strict";

class AutoUpdaterDirector {

  /**
   * @param {Anime} anime
   * @param {EpisodeUpdaterFactory} episodeUpdaterFactory
   * @param {Episode} episodeModel
   * @param {AnimeTorrentSearcher} searcher
   * @param {TransmissionServer} torrentServer
   */
  constructor(anime, episodeUpdaterFactory, episodeModel, searcher, torrentServer) {
    this.anime = anime;
    this.episodeUpdater = episodeUpdaterFactory.create(this, episodeModel);
    this.torrentSearcher = searcher;
    this.torrentServer = torrentServer;
  }

  /**
   * @returns {Promise.<Object[]>}
   */
  searchTorrents() {
    let searchTerm = `[${this.anime.designated_subgroup}] ${this.anime.title}`;
    if (this.anime.screen_resolution) {
      searchTerm = `${searchTerm} ${this.anime.screen_resolution}`;
    }

    return this.torrentSearcher.search(searchTerm);
  }

  /**
   * @returns {Promise.<Object[]>}
   */
  getMissingEpisodes() {
    return this.episodeUpdater.getMissingEpisodes(this.anime);
  }

  /**
   * @returns {Promise}
   */
  postTorrentsToServer() {
    return this.getMissingEpisodes()
      .then(results => {
        let torrentLinks = results.map(e => e.href);
        return this.torrentServer.add(torrentLinks);
      })
      .catch(err => {
        console.error(err);
      });
  }
}

class AutoUpdaterDirectorFactory {

  /**
   * @param episodeUpdaterFactory
   * @param episodeModel
   */
  constructor(episodeUpdaterFactory, episodeModel) {
    this.episodeUpdaterFactory = episodeUpdaterFactory;
    this.episodeModel = episodeModel;
  }

  /**
   * @param {Anime} anime
   * @param {AnimeTorrentSearcher} searcher
   * @param {TransmissionServer} torrentServer
   * @returns {AutoUpdaterDirector}
   */
  create(anime, searcher, torrentServer) {
    return new AutoUpdaterDirector(
      anime,
      this.episodeUpdaterFactory,
      this.episodeModel,
      searcher,
      torrentServer
    );
  }

  /**
   * @param {Anime[]} animeCollection
   * @param {AnimeTorrentSearcher} searcher
   * @param {TransmissionServer} torrentServer
   * @returns {AutoUpdaterDirector[]}
   */
  createCollection(animeCollection, searcher, torrentServer) {
    return animeCollection.map(anime => this.create(anime, searcher, torrentServer));
  }
}

module.exports = AutoUpdaterDirectorFactory;
