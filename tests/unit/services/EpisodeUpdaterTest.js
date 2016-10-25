/**
 * Created by nathanyam on 9/04/2016.
 */

"use strict";

const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
chai.use(chaiAsPromised);

const EpisodeUpdaterFactory = require('../../../src/services/EpisodeUpdater');

describe('UNIT: Episode Updater Service', () => {

  it('should get missing episodes', function() {
    let anime = {
      _id: "5535142b7f6c094d75e04ba9",
      title: "Nisekoi"
    };

    let episodes = [
      {
        fileName: "[Commie] Nisekoi - 01 [4EA59436].mkv",
        number: 1,
        isAnime: true,
        filePath: "/Shows/Nisekoi/[Commie] Nisekoi - 01 [4EA59436].mkv",
        anime: "5535142b7f6c094d75e04ba9",
        _id: "56d7d1a42388d6c8297e6368",
        __v: 0
      }
    ];

    let mediator = {
      searchTorrents() {
        return [
          { name: "[Commie] Nisekoi - 01 [4EA59436].mkv" },
          { name: "[Commie] Nisekoi - 02 [1453ASDF].mkv" }
        ];
      }
    };

    let episodeModel = {
      findPromise() {
        return episodes;
      }
    };

    const factory = new EpisodeUpdaterFactory();
    const episodeUpdater = factory.create(mediator, episodeModel);
    let expected = { name: "[Commie] Nisekoi - 02 [1453ASDF].mkv", episodeNumber: 2 };

    return episodeUpdater.getMissingEpisodes(anime)
      .then(([ result ]) => {
        result.should.deep.equal(expected);
      });
  });
});
