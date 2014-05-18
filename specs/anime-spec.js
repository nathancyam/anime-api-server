/**
 * Created by nathan on 4/6/14.
 */

var Anime = require('../src/backend/models/anime'),
    expect = require('chai').expect,
    async = require('async'),
    mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test:27017');

describe('Anime', function () {

    describe('#flushAnimeCollection()', function () {
        it('should empty the database', function (done) {
            async.series([
                function (next) {
                    Anime.flushAnimeCollection(function () {
                        next(null)
                    });
                },
                function (next) {
                    Anime.find(function (err, results) {
                        expect(results.length).to.equal(0);
                        next(null);
                    });
                }
            ], function (err, results) {
                done();
            });
        });
    });

    describe('#readAnimeDirectory()', function () {
        it('should rebuild the anime directory', function (done) {
            async.series([
                function (next) {
                    Anime.readAnimeDirectory(function () {
                        next(null);
                    });
                },
                function (next) {
                    Anime.find(function (err, results) {
                        expect(results).to.be.an('array');
                        expect(results.length).to.be.greaterThan(0);
                        next(null);
                    });
                }
            ], function (err, endResult) {
                done();
            });
        });
    });
});
