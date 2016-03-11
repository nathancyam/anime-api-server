/**
 * Created by nathanyam on 10/03/2016.
 */

"use strict";

const episodeModel = require('../../models/episode');

/** @var {EpisodeUpdaterFactory} */
const episodeUpdaterFactory = require('../EpisodeUpdater').factory;

/** @var {AnimeTorrentSearcherFactory} */
const torrentSearcherFactory = require('../NyaaTorrentSearcher').factory;

class AutoUpdaterDirector {

  /**
   * @param {Anime} anime
   * @param {Transmission} torrentServer
   */
  constructor(anime, torrentServer) {
    this.anime = anime;
    this.episodeUpdater = episodeUpdaterFactory.create(this, episodeModel);
    this.torrentSearcher = torrentSearcherFactory.create();
    this.torrentServer = torrentServer;

  }

  /**
   * @returns {Promise.<Object[]>}
   */
  searchTorrents() {
    let searchTerm = `[${this.anime.designated_subgroup}] ${this.anime.title}`;
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
   * @param {Anime} anime
   * @param {Transmission} torrentServer
   * @returns {AutoUpdaterDirector}
   */
  create(anime, torrentServer) {
    return new AutoUpdaterDirector(anime, torrentServer);
  }

  /**
   * @param {Anime[]} animeCollection
   * @param {Transmission} torrentServer
   * @returns {AutoUpdaterDirector[]}
   */
  createCollection(animeCollection, torrentServer) {
    return animeCollection.map(anime => this.create(anime, torrentServer));
  }
}

exports.factory = new AutoUpdaterDirectorFactory();