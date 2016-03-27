/**
 * Created by nathanyam on 27/03/2016.
 */

"use strict";

const sinon = require('sinon');
const should = require('chai').should();
const AutoUpdaterFactory = require('../../src/services/AutoUpdater');

describe('AutoUpdater Service', () => {
  describe('AutoUpdaterDirectory', () => {
    const anime = {
      designated_subgroup: 'Commie',
      title: 'Nisekoi'
    };

    it('should delegate its current instance to the episode factory', () => {
      const updater = { create: (delegate, episodeModel) => {} };
      const stub = sinon.stub(updater, 'create');

      const factory = new AutoUpdaterFactory(updater, {});
      let test = factory.create({}, {}, {});
      stub.called.should.equal(true);
      stub.calledWith(test, {}).should.equal(true);
    });

    it('should input the correct search term in the searcher', () => {
      const searcher = { search: (searchTerm) => {} };
      const stub = sinon.stub(searcher, 'search');
      const factory = new AutoUpdaterFactory({ create: () => {}}, {});

      let test = factory.create(anime, searcher, {});
      test.searchTorrents();
      stub.calledWith('[Commie] Nisekoi').should.equal(true);
      stub.called.should.equal(true);
    });

    it('should call the missing episodes', () => {
      const updater = { getMissingEpisodes: (animeObj) => {} };
      const stub = sinon.stub(updater, 'getMissingEpisodes');
      const episodeUpdater = { create: () => updater };

      const factory = new AutoUpdaterFactory(episodeUpdater, {});
      let test = factory.create(anime, {}, {});

      test.getMissingEpisodes();
      stub.called.should.equal(true);
      stub.calledWith(anime).should.equal(true);
    });

    it('should post torrents to the server', (done) => {
      const updater = {
        getMissingEpisodes: () => {
          return Promise.resolve([
            { href: '//nyaa.se/torrents/123' },
            { href: '//nyaa.se/torrents/345' },
            { href: '//nyaa.se/torrents/567' }
          ])
        }
      };

      const torrentServer = { add: (torrent) => {} };
      const stub = sinon.stub(torrentServer, 'add');

      const factory = new AutoUpdaterFactory({ create: () => updater }, {});
      const test = factory.create(anime, {}, torrentServer);
      test.postTorrentsToServer()
        .then(() => {
          stub.called.should.equal(true);
          stub.calledWith(['//nyaa.se/torrents/123', '//nyaa.se/torrents/345', '//nyaa.se/torrents/567'])
          done();
        });
    });

  });
});