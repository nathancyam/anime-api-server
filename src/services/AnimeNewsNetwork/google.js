/**
 * Created by nathanyam on 25/04/2014.
 */

const https = require('https');
const url = require('url');

class GoogleSearch {
  /**
   * @param {Object} config
   */
  constructor(config) {
    const apiKey = config.custSearchAPI;
    const cx = config.custSearchCX;
    this.requestUrl = `https://www.googleapis.com/customsearch/v1?googlehost=google.com&key=${apiKey}&cx=${cx}&q=`;
  }

  _makeRequest(searchTerm, nextPage) {
    nextPage = nextPage || false;

    return new Promise((resolve, reject) => {
      let requestUrl = `${this.requestUrl}${searchTerm}`;
      if (nextPage) {
        requestUrl = `${requestUrl}&queries=nextPage`;
      }

      const request = https.request(url.parse(requestUrl), res => {
        var responseStr = '';

        res.on('data', chunk => responseStr += chunk);
        res.on('end', () => resolve(JSON.parse(responseStr)));
        res.on('error', err => reject(err));
      });

      request.end();
    });
  }

  /**
   * @param {String} searchTerm
   * @returns {Promise}
   */
  searchAnime(searchTerm) {
    return this._makeRequest(searchTerm)
      .then(response => {
        const { items } = response;
        const hasLink = items.some(({ link }) => link.includes('anime.php?id'));

        if (hasLink) {
          return response;
        }

        return this._makeRequest(searchTerm, true);
      });
  }
}

module.exports = GoogleSearch;
