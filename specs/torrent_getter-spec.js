/**
 * Created by nathan on 5/17/14.
 */
/*jslint node: true */
"use strict";

var TorrentGetter = require('./torrent_getter'),
    Anime = require('./anime'),
    mongoose = require('mongoose'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    expect = require('chai').expect;

chai.use(chaiAsPromised);
mongoose.createConnection('mongodb://localhost/test:27017');

describe('Torrent Getter', function() {
    var tGet = null;
    beforeEach(function() {
        tGet = new TorrentGetter();
    });
    describe('#parseAnime', function() {
        it('should return a promise object immediately', function() {
            var promise = tGet.parseAnime();
            expect(promise).to.be.a('object');
        });
        it('should return an array of numbers that are episode numbers', function() {
            tGet.parseAnime().then(function(results) {
                expect(results).to.eventually.be.an('array');
                expect(results.length).to.eventually.be.greaterThan(0);
            });
        });
    });
    describe('#formatAnimeObj', function() {
        var sample = null;
        this.timeout(5000);
        before(function(done) {
            var anime = Anime;
            anime.find({ is_watching: true }, function(err, results) {
                sample = results;
                done();
            });
        });
        after(function() {
            mongoose.disconnect();
        });
        it('should return an array of results', function() {
            expect(sample).to.be.an('array');
        });
        it('should have a simple format', function() {
            expect(sample[0].id).to.be.a('string');
            expect(sample[0].title).to.be.a('string');
        });
    });
    describe('#getSearchQueries', function() {
        it('should return a promise of results', function(){
            expect(tGet.getSearchQueries()).to.be.a('object');
        });
        it('should format the search queries to strings', function() {
            tGet.getSearchQueries()
                .then(function(results) {
                    expect(results).to.eventually.be.an('array');
                    expect(results[0]).to.eventually.be.a('string);')
                });
        });
    });
    describe('#formatSearchString', function() {
        it('should get a title, subgroup and episode number and format them to a searchable string', function(){
            var result = tGet.formatSearchString('test','sub',1);
            expect(result).to.equal('[sub] test 02');
        });
    });
    describe('#getSearchResults', function() {
        var testContent = function(content) {
            return content.every(function(e) {
                var checkOne = e.href !== undefined,
                    checkTwo = e.name !== undefined,
                    checkThree = e.id !== undefined;

                return checkOne && checkTwo && checkThree;
            });
        };
        it('should return an array of results', function() {
            tGet.getSearchResults().then(function(results) {
                expect(results).to.eventually.be.an('array');
                expect(testContent(results)).to.be.ok();
            });
        })
    });
});

