const request = require('request');
const qs = require('querystring');
const xml2js = require('xml2js');
const crypto = require('crypto');
const path = require('path');

const NYAA_URL = `https://nyaa.si`;
const CACHE_TTL_MIN = 1000 * 60 * 2;

/**
 * @param {String} url
 * @return {Promise.<Object>}
 * @private
 */
const _requestGet = (url) => new Promise((resolve, reject) => {
  request.get(url, (err, resp, body) => {
    if (err) {
      return reject(err);
    }

    return resolve(body);
  });
});

/**
 * @typedef {{term: String}} SearchObject
 */

/**
 * @typedef {Object} Torrent
 * @property {String} id
 * @property {String} href
 * @property {String} name
 * @property {String[]} categories
 * @property {String} size
 * @property {String|Number} seeds
 * @property {String|Number} leechers
 * @property {String|Number} downloads
 */

class Searcher {

  constructor(options = { useCache: true }) {
    this.cache = {};
    this.options = options;
  }

  /**
   * @param {SearchObject} searchObj
   * @return {Promise.<Torrent>}
   */
  search(searchObj) {
    const queryObj = {
      page: 'rss',
      q: searchObj.term,
      c: '1_2',
      f: 0,
    };

    const now = Date.now();
    const searchUrl = `${NYAA_URL}/?${qs.stringify(queryObj)}`;
    const hash = crypto.createHash('md5').update(queryObj.q).digest("hex");

    if (!this.cache[hash]) {
      return _requestGet(searchUrl)
        .then(this.parseRssXml)
        .then(body => {
          this.cache[hash] = {
            expiry: now + CACHE_TTL_MIN,
            value: body,
          };

          return this.search(searchObj);
        })
        .catch(err => {
          console.error('Issue detected for search', searchUrl);
          console.error(err);
        });
    }

    if (this.cache[hash].expiry < now){
      delete this.cache[hash];
      return this.search(searchObj);
    }

    return Promise.resolve(this.cache[hash].value);
  }

  /**
   * @param {String} body
   * @returns {Promise.<Torrent>}
   */
  parseRssXml(body) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(body.toString(), (err, js) => {
        if (err) {
          return reject(err);
        }

        if (!js) {
          return reject('Empty response')
        }

        const { item } = js.rss.channel[0];

        const torrents = item.map(torrent => {
          const category = torrent['nyaa:category'];
          const categories = category.concat(category.map(cat => cat.toLowerCase()));

          return {
            id: path.basename(torrent.guid[0]._),
            href: torrent.link[0],
            name: torrent.title[0],
            categories,
            size: torrent['nyaa:size'][0],
            seeds: torrent['nyaa:seeders'][0],
            leeches: torrent['nyaa:leechers'][0],
            downloads: torrent['nyaa:downloads'][0],
          }

        });

        return resolve(torrents);
      });
    });
  }
}

module.exports = Searcher;
