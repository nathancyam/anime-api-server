/**
 * Created by nathanyam on 14/04/2014.
 */

var AnnResource = require('./ann'),
    ann = new AnnResource(),
    expect = require('chai').expect;

describe('Anime News Network API', function () {
    describe('#search()', function () {
        it('should search an anime by name and return a JSON object', function (done) {
            this.timeout(5000);
            ann.search({ name: 'Kill la Kill'}, function (err, result) {
                expect(result).to.be.a('object');
                done();
            });
        });
        it('should search an anime by ID and return a JSON detailed object', function (done) {
            ann.search({ ann_id: 15101 }, function (err, result) {
                expect(result).to.be.a('object');
                expect(result).to.have.property('ann');
                expect(result.ann.anime).to.be.a('array');
                done();
            });
        });
        it('should give us an anime from Google if it could not be found', function (done) {
            ann.search('Sakurasou no Pet na Kanojo', function (err, result) {
                expect(result).to.be.a('object');
                done();
            });
        });
        it('should give us multiple results', function (done) {
            ann.search({ name: 'Fate' }, function (err, result) {
                expect(result).to.be.a('array');
                expect(result.length).to.be.greaterThan(1);
                done();
            });
        });
    });
});
