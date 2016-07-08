/**
 * Created by nathanyam on 6/07/2016.
 */

"use strict";

const xml2js = require('xml2js');

function dollarParser(key, attribute) {
  return info => {
    var animeInfo = info.ann.anime[0].info[0],
      animeInfoArray = [];

    function recur() {
      Object.keys(animeInfo).map(element => {
        if (animeInfo[element].length !== undefined && Array.isArray(animeInfo[element])) {
          animeInfo[element].filter(arrayElement => arrayElement.$[key] !== undefined)
            .forEach(e => {
              animeInfoArray.push(e.$[key]);
            });
        }
        if (element === '$') {
          if (animeInfo[element][key] !== undefined) {
            animeInfoArray.push(animeInfo[element][key]);
          }
        }
      });
    }

    recur();

    info[attribute] = animeInfoArray;
  };
}

function underscoreParser(type) {
  var key = type.toLowerCase().replace(/\s/g, '_');
  return function (data) {
    var animeInfo = data.ann.anime[0].info,
      resultArray = animeInfo.reduce(function (prev, curr) {
        if (curr.$.type && curr.$.type === type) {
          prev.push(curr._);
        }
        return prev;
      }, []);

    data[key] = resultArray;
  };
}

function voiceActParser(data) {
  var castInfo = data.ann.anime[0].cast;

  if (!castInfo) {
    return [];
  }

  data.cast = castInfo.filter(function (e) {
    return e.$.lang === 'JA';
  }).reduce(function (prev, cur) {
    prev.push({
      character: cur.role.length == 1 ? cur.role[0] : cur.role,
      seiyuu: cur.person[0]._,
      seiyuu_id: cur.person[0].$.id
    });
    return prev;
  }, []);
}

function numberOfEpisodeParser (data) {
  if (data.ann.anime[0].episode !== undefined) {
    data.number_of_episodes = data.ann.anime[0].episode.length;
  } else {
    data.number_of_episodes = 'N/A';
  }
}

const parsers = [
  dollarParser('src', 'images'),
  underscoreParser('Main title'),
  underscoreParser('Genres'),
  underscoreParser('Themes'),
  numberOfEpisodeParser,
  underscoreParser('Plot Summary'),
  voiceActParser,
  underscoreParser('Opening Theme'),
  underscoreParser('Ending Theme')
];

class ResponseParser {

  /**
   * @param {Object[]} afterApply
   */
  constructor(afterApply) {
    this.afterApply = afterApply;
  }

  /**
   * @param {String} xmlResponse
   * @returns {Promise}
   */
  parse(xmlResponse) {
    return this._parse(xmlResponse)
      .then(response => {
        this.afterApply.forEach(parseApplier => {
          parseApplier(response);
        });
        return response;
      });
  }

  _parse(xmlResponse) {
    const parser = xml2js.Parser();

    return new Promise((resolve, reject) => {
      parser.parseString(xmlResponse, (err, result) => {
        if (err) {
          return reject(err);
        }

        return resolve(result);
      });
    });
  }
}

class ResponseParserFactory {
  static createWithParsers() {
    return new ResponseParser(parsers);
  }

  static create() {
    return new ResponseParser([]);
  }
}

module.exports = ResponseParserFactory;