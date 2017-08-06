const NT = require('./search');

/**
 * Searches a torrent resource such as NyaaTorrents for anime.
 *
 * @constructor
 * @type {exports}
 */
class AnimeTorrentSearcher {

  constructor() {
    this.nyaaTorrents = new NT();
  }

  /**
   * Returns a promise for the results of the torrent search (i.e. NyaaTorrents).
   *
   * @param searchTerms Search terms to be used to search the torrent resource
   * @returns {Promise.<Array>}
   * @private
   */
  search(searchTerms) {
    return this.nyaaTorrents.search({ term: searchTerms });
  }
}

module.exports = AnimeTorrentSearcher;
