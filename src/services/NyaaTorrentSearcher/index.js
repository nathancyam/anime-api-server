/**
 * Created by nathanyam on 10/03/2016.
 */

"use strict";

const NT = require('nyaatorrents');

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
    return new Promise((resolve, reject) => {
      this.nyaaTorrents.search(searchObj, (err, result) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        return resolve(result);
      })
    });
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
