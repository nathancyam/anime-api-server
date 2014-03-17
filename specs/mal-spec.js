/**
 * Created by nathan on 3/17/14.
 */


var mal = require('../src/helpers/mal').MyAnimeListModule;
var expect = require('chai').expect;

describe('MyAnimeList', function () {
    describe('#search()', function () {
        it('should search an anime and return a JSON object', function (done) {
            mal.search('Bakemonogatari', function (err, result) {
                expect(result).to.be.a('object');
                expect(result).to.have.property('anime');
                expect(result.anime.entry).to.be.a('array');
                done();
            });
        });
        it('should return no results if we can not find an anime', function (done) {
            mal.search('wubwubwubuwbu', function (err, result) {
                expect(result).to.equal('No results');
                done();
            });
        });
    });
    describe('#parseMalResult()', function () {
        it('should parse some XML', function () {
            var result = mal.parseMalResult('<example>Test</example>');
            expect(result).to.be.a('object');
            expect(result).to.have.property('example');
            expect(result.example).to.equal('Test');
        });
    });
});