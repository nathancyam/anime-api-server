const qs = require('querystring');
const request = require('request');

const ANN_GENERAL_URI = 'http://www.animenewsnetwork.cc/encyclopedia/reports.xml?id=155&type=anime';
const ANN_ALL_ANIME = 'http://www.animenewsnetwork.cc/encyclopedia/reports.xml?id=155&nlist=all&type=anime';
const ANN_SPECIFIC_URI = 'http://cdn.animenewsnetwork.cc/encyclopedia/api.xml';

class Searcher {
  /**
   * @param {NameSearcher} nameSearcher
   * @param {IdSearcher} idSearcher
   * @param {AnnImageHandler} imageHandler
   */
  constructor(nameSearcher, idSearcher, imageHandler) {
    this.nameSearcher = nameSearcher;
    this.idSearcher = idSearcher;
    this.imageHandler = imageHandler;
  }

  /**
   * @param {Object} searchObj
   * @returns {Promise}
   */
  search(searchObj) {
    const { name, annId } = searchObj;
    let searchFn;

    if (name && typeof annId === 'undefined') {
      searchFn = this.nameSearcher.search.bind(this.nameSearcher, name);
    }

    if (annId && typeof name === 'undefined') {
      searchFn = this.idSearcher.search.bind(this.idSearcher, annId);
    }

    return searchFn()
      .then(response => {
        return this.imageHandler.handle(response);
      });
  }
}

class IdSearcher {
  /**
   * @param {ResponseParser} parser
   */
  constructor(parser) {
    this._cache = {};
    this.parser = parser;
  }

  search(annId) {
    return new Promise((resolve, reject) => {
      const cacheKey = `ann_${annId}`;

      if (this._cache[cacheKey]) {
        return resolve(this._cache[cacheKey]);
      }

      request.get(`${ANN_SPECIFIC_URI}?${qs.stringify({ anime: annId })}`, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        this.parser.parse(body)
          .then(result => {
            this._cache[cacheKey] = result;
            return resolve(result)
          })
          .catch(err => reject(err));
      });
    });
  }
}

class NameSearcher {
  /**
   * @param {IdSearcher} idSearcher
   * @param {GoogleSearch} googleHelper
   * @param {ResponseParser} parser
   */
  constructor(idSearcher, googleHelper, parser) {
    this.idSearcher = idSearcher;
    this.googleHelper = googleHelper;
    this.parser = parser;
  }

  /**
   * @param animeName
   * @returns {Promise.<Object>}
   * @private
   */
  _startGoogleSearch(animeName) {
    return this.googleHelper.searchAnime(animeName)
      .then(({ items }) => {
        const [{ link }] = items.filter(({ link }) => {
          return link.indexOf('anime.php?id') !== -1;
        });

        const [_, annId] = link.match(/php\?id=(\d*)$/);
        return this.idSearcher.search(parseInt(annId));
      });
  }

  /**
   * @param {String} name
   * @returns {Promise}
   */
  search(name) {
    return new Promise((resolve, reject) => {

      request.get(`${ANN_GENERAL_URI}&${qs.stringify({ name: name })}`, (err, resp, body) => {

        if (err) {
          return reject(err);
        }

        return this.parser.parse(body)
          .then(result => {
            const { report: { item, args } } = result;
            const [{ name: [ animeName ] }] = args;

            if (typeof item === 'undefined' && animeName) {
              return this._startGoogleSearch(animeName);
            }

            const [{ id: [ annId ] }] = item;

            return this.idSearcher.search(parseInt(annId));
          })
          .then(result => resolve(result))
          .catch(err => {
            console.error(err.message);
          });
      });
    });
  }
}

exports.Searcher = Searcher;
exports.IdSearcher = IdSearcher;
exports.NameSearcher = NameSearcher;
