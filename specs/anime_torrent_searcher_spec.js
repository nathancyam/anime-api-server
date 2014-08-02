/**
 * Created by nathan on 5/18/14.
 */

/*jslint node: true*/
"use strict";

var AnimeTorrentSearcher = require('../src/backend/resources/anime_torrent_searcher'),
    Anime = require('../src/backend/models/anime'),
    mongoose = require('mongoose'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    expect = require('chai').expect;

chai.use(chaiAsPromised);

describe('AnimeTorrentSearcher', function() {

    describe('#search', function() {
        // Create the anime that we are going to test against.
        var animeSearcher = null;
        before(function(done) {
            if (mongoose.connection.readyState === 1) {
                return done();
            }
            mongoose.connect('mongodb://localhost/test:27017', done);
        });

        beforeEach(function (done) {
            if (animeSearcher) {
                return done();
            } else {
                Anime.find({ title: 'Log Horizon' }, function (err, result) {
                    animeSearcher = new AnimeTorrentSearcher(result);
                    done();
                });
            }
        });

        it('should return a promise initially', function() {
            var search = animeSearcher.search();
            expect(search).to.be.a('object');
        });
        it('should return results eventually', function() {
            animeSearcher.search().then(function(results) {
                expect(results).to.eventually.be.an('array');
                expect(results[0]).to.eventually.have.keys(['href', 'name', 'seeders']);
            });
        });
    });
});