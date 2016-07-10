/**
 * Created by nathanyam on 25/04/2014.
 */

const https = require('https');
const url = require('url');
const qs = require('qs');
const winston = require('winston');

class GoogleSearch {
  /**
   * @param {Object} config
   */
  constructor(config) {
    const apiKey = config.custSearchAPI;
    const cx = config.custSearchCX;
    this.requestUrl = `https://www.googleapis.com/customsearch/v1?googlehost=google.com&key=${apiKey}&cx=${cx}`;
  }

  _makeRequest(searchTerm, counter) {
    counter = counter || 0;

    return new Promise((resolve, reject) => {
      let requestUrl = `${this.requestUrl}&${qs.stringify({ q: searchTerm, startIndex: counter })}`;

      winston.info(`google url: ${requestUrl}`);
      const request = https.request(url.parse(requestUrl), res => {
        var responseStr = '';

        res.on('data', chunk => {
          winston.info(`writing`);
          responseStr += chunk
        });
        res.on('end', () => {
          winston.info(`Finished`);
          return resolve(JSON.parse(responseStr))
        });
        res.on('error', err => {
          winston.error(err);
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
  searchAnime(searchTerm, counter) {
    counter = counter || 0;
    return this._makeRequest(searchTerm)
      .then(response => {
        const { items } = response;
        winston.info(`Google items: ${items}`);
        const hasLink = items.some(({ link }) => link.includes('anime.php?id'));

        if (hasLink) {
          winston.info(`found link`);
          return response;
        }

        return this.searchAnime(searchTerm, (counter + 1) * 10);
      });
  }
}

module.exports = GoogleSearch;
