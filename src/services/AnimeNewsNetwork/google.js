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

  /**
   * @param {String} searchTerm
   * @returns {Promise}
   */
  searchAnime(searchTerm) {
    return new Promise((resolve, reject) => {
      var requestUrl = this.requestUrl + searchTerm;
      var request = https.request(url.parse(requestUrl), function (res) {
        var responseStr = '';

        res.on('data', chunk => responseStr += chunk);
        res.on('end', () => resolve(JSON.parse(responseStr)));
        res.on('error', err => reject(err));
      });

      request.end();
    });
  }
}

module.exports = GoogleSearch;
