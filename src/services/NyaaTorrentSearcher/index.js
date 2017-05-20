/**
 * Created by nathanyam on 10/03/2016.
 */

"use strict";

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
   * @param searchObj
   * @returns {Promise}
   */
  searchNyaaTorrents(searchObj) {
    return this.nyaaTorrents.search(searchObj);
  }

  /**
   * Returns a promise for the results of the torrent search (i.e. NyaaTorrents).
   *
   * @param searchTerms Search terms to be used to search the torrent resource
   * @returns {Promise.<Array>}
   * @private
   */
  search(searchTerms) {
    return this.searchNyaaTorrents({ term: searchTerms });
  }
}

module.exports = AnimeTorrentSearcher;
