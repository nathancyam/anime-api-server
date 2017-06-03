
/**
 * @typedef {Object} GoogleCustomSearchResponse
 * @property {Object[]} items
 */

const https = require('https');
const url = require('url');
const qs = require('querystring');

const GOOGLE_COUNTER_LIMIT = 30;

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
  _makeRequest(searchTerm, counter) {

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
    return this._makeRequest(searchTerm, counter)
      .then(response => {
        const { items, error } = response;

        if (error) {
          throw error;
        }

        const hasLink = items.some(({ link }) => link.includes('anime.php?id'));

        if (hasLink) {
          return response;
        } else if (counter >= GOOGLE_COUNTER_LIMIT) {
          throw new Error(`Exceeded Google Counter limit of ${GOOGLE_COUNTER_LIMIT}`);
        } else {
          return this.searchAnime(searchTerm, (counter + 10));
        }
      });
  }
}

class RedisGoogleSearch {

  /**
   * @param {RedisConnection} redisConn
   * @param {GoogleSearch} googleHelper
   */
  constructor(redisConn, googleHelper) {
    this.socketHandler = redisConn;
    this.googleHelper = googleHelper;
  }

  /**
   * @param {String} searchTerm
   * @returns {String}
   */
  getCacheKey(searchTerm) {
    return `google_ann_id_${searchTerm.toLowerCase().replace(/\s/gi, '_')}`;
  }

  /**
   * @param searchTerm
   * @returns {Promise.<{canCache: boolean, res: Object}>}
   * @private
   */
  _searchGoogle(searchTerm) {
    return this.googleHelper.searchAnime(searchTerm)
      .then(res => ({ canCache: true, res }));
  }

  /**
   * @param searchTerm
   * @returns {Promise.<Object>}
   */
  searchAnime(searchTerm) {
    return this.socketHandler
      .getConnection()
      .get(this.getCacheKey(searchTerm))
      .then(res => {
        if (res) {
          return { canCache: false, res: JSON.parse(res) };
        } else {
          return this._searchGoogle(searchTerm);
        }
      })
      .then(response => {
        if (response.canCache) {
          return this.socketHandler
            .getConnection()
            .set(this.getCacheKey(searchTerm), JSON.stringify(response.res))
            .then(() => {
              return response.res;
            })
        } else {
          return response.res;
        }
      });
  }
}

exports.GoogleSearch = GoogleSearch;
exports.RedisGoogleSearch = RedisGoogleSearch;
