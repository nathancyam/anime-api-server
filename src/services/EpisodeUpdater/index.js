/**
 * Created by nathanyam on 10/03/2016.
 */

"use strict";

const EpisodeHelper = require('../../helpers/episode');

/**
 *
 * @param torrents
 * @returns {Array}
 */
function setTorrentEpisodeNumbers(torrents) {
  return torrents.map(e => {
    e.episodeNumber = EpisodeHelper.getEpisodeNumberByFileName(e.name);
    return e;
  });
}

class EpisodeUpdater {

  /**
   * @param {AutoUpdaterDirector} mediator
   * @param {Episode} episodeModel
   */
  constructor(mediator, episodeModel) {
    this.mediator = mediator;
    this.episodeModel = episodeModel;
  }

  /**
   * Gets an array of episodes that we have on the disk
   * @returns {Episode[]}
   */
  getEpisodeOnDisk(animeId) {
    return this.episodeModel.findPromise({ anime: animeId });
  }

  /**
   * Get the missing episodes for a given anime model/id
   *
   * @param {Anime|Number} animeModel
   * @returns {Promise.<Object[]>}
   */
  getMissingEpisodes(animeModel) {
    let animeId = animeModel;
    if (typeof animeModel === 'object') {
      animeId = animeModel._id;
    }

    return Promise.all(
      [
        this.getEpisodeOnDisk(animeId),
        this.mediator.searchTorrents()
      ]
    )
    .then(this._compareMissingEpisodes)
    .catch(err => console.error(err));
  }

  /**
   * Compares the torrent listing and the list of episodes on the harddrive
   * to determine which ones are missing
   *
   * @private
   * @param results
   * @returns {Object[]}
   */
  _compareMissingEpisodes(results) {
    const episodeCollection = results[0];
    const torrentResults = results[1];

    if (!Array.isArray(torrentResults) || torrentResults.length === 0) {
      return [];
    }

    let episodesOnDisk = episodeCollection.map(ep => ep.number);
    let torrentArray = setTorrentEpisodeNumbers(torrentResults);
    return torrentArray.filter(e => e.episodeNumber && !episodesOnDisk.includes(e.episodeNumber));
  }
}

class EpisodeUpdaterFactory {

  /**
   * @param {AutoUpdaterDirector} mediator
   * @param {Episode} episodeModel
   * @returns {EpisodeUpdater}
   */
  create(mediator, episodeModel) {
    return new EpisodeUpdater(mediator, episodeModel);
  }

}

module.exports = EpisodeUpdaterFactory;
