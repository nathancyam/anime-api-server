
/**
 * @typedef {Object} GoogleCustomSearchResponse
 * @property {Object[]} items
 */

const https = require('https');
const url = require('url');
const qs = require('qs');

class GoogleSearch {
  /**
   * @param {Object} config
   */
  constructor(config) {
    const apiKey = config.custSearchAPI;
    const cx = config.custSearchCX;
    this.requestUrl = `https://www.googleapis.com/customsearch/v1?googlehost=google.com&key=${apiKey}&cx=${cx}`;
  }

  /**
   * @param {String} searchTerm
   * @param {Number} counter
   * @returns {Promise.<GoogleCustomSearchResponse>}
   * @private
   */
  _makeRequest(searchTerm, counter = 0) {

    return new Promise((resolve, reject) => {
      let requestUrl = `${this.requestUrl}&${qs.stringify({ q: searchTerm, startIndex: counter })}`;

      const request = https.request(url.parse(requestUrl), res => {
        let responseStr = '';

        res.on('data', chunk => {
          responseStr += chunk
        });
        res.on('end', () => {
          const result = JSON.parse(responseStr);
          responseStr = '';
          return resolve(result);
        });
        res.on('error', err => {
          return reject(err)
        });
      });

      request.end();
    });
  }

  /**
   * @param {String} searchTerm
   * @param {Number} counter
   * @returns {Promise}
   */
  searchAnime(searchTerm, counter = 0) {
    return this._makeRequest(searchTerm)
      .then(response => {
        const { items } = response;
        const hasLink = items.some(({ link }) => link.includes('anime.php?id'));

        if (hasLink) {
          return response;
        }

        return this.searchAnime(searchTerm, (counter + 1) * 10);
      });
  }
}

module.exports = GoogleSearch;
