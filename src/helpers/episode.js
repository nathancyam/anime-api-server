/**
 * Created by nathan on 4/7/14.
 */

var Episode = require('../models/episode'),
    Anime = require('../models/anime'),
    async = require('async'),
    fs = require('fs');

/** @typedef {{subgroup: String, animeTitle: String, number: String, filename: String}} EpisodeAttributePayload */

/**
 * @constructor
 */
module.exports = {

  getEpisodeFilenames: (animeModel, done) => {
    fs.readdir(animeModel.filepath, (err, files) => {
      if (err) {
        return done(err, null);
      }
      async.each(files, (file, next) => {
        var episode = new Episode({
          filePath: animeModel.filepath + '/' + file,
          anime: animeModel.id
        });
        episode.isAnime = true;
        episode.getEpisodeNumber();
        episode.save(function () {
          next(null);
        });
      }, function () {
        done(null);
      });
    });
  },

  createEpisodeModels: (done) => {
    var self = this;
    async.waterfall([
      function (next) {
        Anime.find(function (err, result) {
          next(null, result);
        });
      },
      function (results, finished) {
        async.each(results, function (anime, cb) {
          self.getEpisodeFilenames(anime, function () {
            cb();
          });
        }, function () {
          finished(null);
        });
      }
    ], function (err) {
      if (err) {
        done(err, null);
      } else {
        done(null, { status: 'SUCCESS' });
      }
    });
  },

  getEpisodeNumberByFileName: (fileName) => {
    var number = fileName.match(/\d{2}/i);
    if (number) {
      var epNumber = parseInt(number.shift());
      if (epNumber < 32) {
        return epNumber;
      }
    } else {
      return null;
    }
  },

  /**
   * @param {EpisodeAttributePayload} episodeAttributes
   * @return {Promise.<Episode>}
   */
  setEpisodeModelToAnime: function setEpisodeModelToAnime (episodeAttributes) {
    const normalizedTitle = Anime.getNormalizedName(episodeAttributes.animeTitle);

    const checkAnime = (searchCriteria) => {
      return Anime.promisify(Anime.findOne.bind(Anime))(searchCriteria)
        .then(anime => {
          if (!anime) {
            throw new Error('Anime not found');
          }

          return anime;
        })
    };

    return new Promise((resolve, reject) => {
      checkAnime({ normalizedName: normalizedTitle })
        .then(anime => {

          Episode.findOne({ filePath: `${anime.filepath}/${episodeAttributes.filename}` }, (err, result) => {
            if (!result) {
              var episode = new Episode({
                anime: anime._id,
                filePath: `${anime.filepath}/${episodeAttributes.filename}`,
                isAnime: true,
                number: episodeAttributes.number
              });

              episode.save(() => resolve(episode));
            } else {
              resolve(result);
            }
          });
        })
        .catch(err => {
          if (err.message === 'Anime not found') {
            Anime.create({
              title: episodeAttributes.animeTitle,
              normalizedName: normalizedTitle
            }, () => {
              return resolve(setEpisodeModelToAnime(episodeAttributes));
            })
          }
        });
    });
  }

};
