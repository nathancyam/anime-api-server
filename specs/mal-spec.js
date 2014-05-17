/**
 * Created by nathan on 3/17/14.
 */


var mal = require('./mal.js');
var expect = require('chai').expect;

describe('MyAnimeList', function () {
    describe('#searchByName()', function () {
        it('should search an anime and return a JSON object', function (done) {
            mal.searchByName('Bakemonogatari', function (err, result) {
                expect(result).to.be.a('object');
                expect(result).to.have.property('anime');
                expect(result.anime.entry).to.be.a('array');
                done();
            });
        });
        it('should return no results if we can not find an anime', function (done) {
            mal.searchByName('wubwubwubuwbu', function (err, result) {
                expect(result).to.equal('No results');
                done();
            });
        });
    });
});