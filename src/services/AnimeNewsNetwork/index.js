/**
 * Created by nathanyam on 4/07/2016.
 */

"use strict";

const qs = require('querystring');
const request = require('request');

const ANN_GENERAL_URI = 'http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&type=anime';
const ANN_ALL_ANIME = 'http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist=all&type=anime';
const ANN_SPECIFIC_URI = 'http://cdn.animenewsnetwork.com/encyclopedia/api.xml';

class Searcher {
  /**
   * @param {NameSearcher} nameSearcher
   * @param {IdSearcher} idSearcher
   */
  constructor(nameSearcher, idSearcher) {
    this.nameSearcher = nameSearcher;
    this.idSearcher = idSearcher;
  }

  /**
   * @param {Object} searchObj
   * @returns {Promise}
   */
  search(searchObj) {
    const { name, annId } = searchObj;

    if (name && typeof annId === 'undefined') {
      return this.nameSearcher.search(name);
    }

    if (annId && typeof name === 'undefined') {
      return this.idSearcher.search(annId);
    }
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
          .then(result => resolve(result));
      });
    });
  }
}

exports.Searcher = Searcher;
exports.IdSearcher = IdSearcher;
exports.NameSearcher = NameSearcher;
