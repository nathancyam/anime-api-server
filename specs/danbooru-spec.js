/**
 * Created by nathanyam on 26/04/2014.
 */

var DanbooruResource = require('../src/backend/resources/danbooru'),
    expect = require('chai').expect;

describe('DanbooruResource Helper', function () {
    var defaultDanbooru = new DanbooruResource(),
        customDanbooru = new DanbooruResource({ imageLimit: 3});

    describe('#getImages()', function () {
        it('should get a list of 5 images by default', function (done) {
            defaultDanbooru.getImages(['touhou'], function (err, result) {
                expect(result).to.be.a('array');
                expect(result.length).to.eql(5);
                done();
            });
        });
        it('should only get a defined limit set in the options', function (done) {
            customDanbooru.getImages(['touhou'], function (err, result) {
                expect(result.length).to.eql(3);
                done();
            });
        });
    });
});
