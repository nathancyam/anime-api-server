/**
 * Created by nathan on 4/6/14.
 */

var Anime = require('../src/backend/models/anime'),
    chai = require('chai'),
    expect = require('chai').expect,
    async = require('async'),
    mongoose = require('mongoose'),
    chaiAsPromised = require('chai-as-promised');


var FS = require('fs');

var ANN_PUBLIC_IMG_DIR = require('../src/backend/config').image_dir;

chai.use(chaiAsPromised);
mongoose.connect('mongodb://localhost/test:27017');

describe('Anime', function () {
    var testCase = null;
    var filePath = ANN_PUBLIC_IMG_DIR + '/' + 'ann_testcase_full.jpg';
    beforeEach(function (done) {
        testCase = new Anime();
        testCase.title = 'Test Case';
        done();
    });

    after(function (done) {
        testCase.remove(function () {
            mongoose.connection.close();
            FS.unlinkSync(filePath);
            done();
        });
    });

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
        this.timeout(10000);
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

    describe('#getPictureUrl', function () {
        this.timeout(5000);
        it('should return the image URL if it has been set', function (done) {
            testCase.image_url = '/test.jpg';
            testCase.getPictureUrl(function (err, result) {
                expect(result).to.equal(testCase.image_url);
                done();
            });
        });

        it('should get the image from the file system if it set in the database', function (done) {
            testCase.image_url = '/test.jpg';
            testCase.save(function () {
                testCase.getPictureUrl(function (err, result) {
                    expect(result).to.equal(testCase.image_url);
                    done();
                });
            });
        });

        it('should get the image from the file system if an image URL property is not found', function (done) {
            testCase.normalizedName = 'testcase';
            delete testCase.image_url;
            FS.open(filePath, 'w', function() {
                testCase.save(function () {
                    testCase.getPictureUrl(function (err, result) {
                        expect(result).to.eql('/media/images/ann_testcase_full.jpg');
                        done();
                    });
                });
            });
        });
    });
});
