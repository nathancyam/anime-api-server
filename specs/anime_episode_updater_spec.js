/**
 * Created by nathan on 5/18/14.
 */

/*jslint node: true*/
"use strict";

var AnimeEpUpdater = require('../src/backend/modules/anime_episode_updater'),
    Anime = require('../src/backend/models/anime'),
    mongoose = require('mongoose'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    expect = require('chai').expect;

chai.use(chaiAsPromised);
mongoose.createConnection('mongodb://localhost/test:27017');

describe('AnimeEpisodeUpdater', function() {
    var anime, test = null;

    before(function(done) {
        if (mongoose.connection.readyState === 1) {
            return done();
        }
        mongoose.connect('mongodb://localhost/test:27017', done);
    });

    beforeEach(function(done) {
        if (anime) {
            test = new AnimeEpUpdater(anime);
            return done();
        } else {
            Anime.find({title:'Nisekoi'}, function(err, results) {
                anime = results;
                test = new AnimeEpUpdater(anime);
                done();
            });
        }
    });
    describe('#getEpisodeOnDisk', function() {
        it('should return a promise initially', function() {
            var promise = test.getEpisodeOnDisk();
            expect(promise).to.be.a('object');
        });
        it('should eventually return an array of episodes that we have on disk', function() {
            var promise = test.getEpisodeOnDisk();
            expect(promise).to.eventually.be.an('array');
        });
    });
    describe('#getTorrents', function() {
        it('should return a promise initially', function() {
            var promise = test.getTorrents();
            expect(promise).to.be.a('object');
        });
        it('should eventually return an array of torrents found', function() {
            var promise = test.getEpisodeOnDisk();
            expect(promise).to.eventually.be.an('array');
        });
    });
    describe('#getMissingEpisodes', function() {
        it('should return a promise initially', function() {
            var promise = test.getMissingEpisodes();
            expect(promise).to.be.a('object');
        });
        it('should eventually return an array of torrents found', function() {
            var promise = test.getMissingEpisodes();
            expect(promise).to.eventually.be.an('array');
        });
    });
});
