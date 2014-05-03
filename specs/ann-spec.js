/**
 * Created by nathanyam on 14/04/2014.
 */

var ann = require('../src/resources/ann');
var expect = require('chai').expect;

describe('Anime News Network API', function () {
    describe('#searchByName()', function () {
        it('should search an anime and return a JSON object', function (done) {
            ann.searchByName('Kill la Kill', function (err, result) {
                expect(result).to.be.a('object');
                done();
            });
        });
        it('should give us an anime from Google if it could not be found', function (done) {
            ann.searchByName('Sakurasou no Pet na Kanojo', function (err, result) {
                if (ann.isEmpty(result)) {
                    ann.handleEmptyResponse(result, function (err, result) {
                        expect(result).to.be.a('object');
                        expect(result).to.have.property('ann');
                        expect(result.ann.anime).to.be.a('array');
                        done();
                    });
                }
            });
        });
    });
    describe('#searchById()', function () {
        it('should give a more detailed log of the anime by ID', function (done) {
            ann.searchById(13310, function (err, result) {
                expect(result).to.be.a('object');
                expect(result).to.have.property('ann');
                expect(result.ann.anime).to.be.a('array');
                done();
            });
        });
    });
});
