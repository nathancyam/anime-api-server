/**
 * Created by nathanyam on 14/04/2014.
 */

var AnnResource = require('../src/backend/resources/ann'),
    ann = new AnnResource(),
    FS = require('fs'),
    path = require('path'),
    url = require('url'),
    chai = require('chai'),
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised');

var Config = require('../src/backend/config');

chai.use(chaiAsPromised);

describe('Anime News Network API', function () {
    describe('#search()', function () {
        it('should search an anime by name and return a JSON object', function () {
            ann.search({ name: 'Kill la Kill'}).then(function (result) {
                expect(result).to.eventually.be.a('object');
            });
        });
        it('should search an anime by ID and return a JSON detailed object', function () {
            ann.search({ ann_id: 15101 }).then(function (result) {
                expect(result).to.eventually.be.a('object');
                expect(result).to.eventually.have.property('ann');
                expect(result.ann.anime).to.eventually.be.a('array');
            });
        });
        it('should give us an anime from Google if it could not be found', function () {
            ann.search({ name: 'Sakurasou no Pet na Kanojo' }).then(function (result) {
                expect(result).to.eventually.be.a('object');
            });
        });
        it('should get us an image from ANN if an anime ID is specified', function (done) {
            ann.search({ ann_id: 15101 }).then(function (result) {
                expect(result.images).to.be.a('array');
                FS.readdir(Config.image_dir, function (err, files) {
                    var shouldBeHere = files.some(function (file) {
                        var fileBaseName = path.basename(file);
                        var urlFilePath = path.basename(url.parse(result.images[0]).pathname);
                        return fileBaseName === urlFilePath;
                    });
                    expect(shouldBeHere).to.equal(true);
                    done();
                });
            });
        });
    });
});
