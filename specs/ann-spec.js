/**
 * Created by nathanyam on 14/04/2014.
 */

var ann = require('../src/helpers/ann');
var expect = require('chai').expect;

describe('Anime News Network API', function () {
    describe('#searchByName()', function () {
        it('should search an anime and return a JSON object', function (done) {
            ann.searchByName('Bakemonogatari', function (err, result) {
                expect(result).to.be.a('object');
                done();
            });
        });
    });
    describe('#searchById()', function() {
        it('should give a more detailed log of the anime by ID', function(done) {
            ann.searchById(13310, function(err, result) {
                expect(result).to.be.a('object');
                expect(result).to.have.property('ann');
                expect(result.ann.anime).to.be.a('array');
                done();
            });
        });
        it('should give us a warning if no anime actually exists', function(done) {
            ann.searchById(1234567890, function(err, result) {
                expect(result).to.be.a('object');
                expect(result.ann).to.have.property('warning');
                done();
            })
        });
    });
});
