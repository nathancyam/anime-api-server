var assert = require('assert');

var animeDirectory = require('../src/models/anime');

describe('Reading file paths', function () {
    var testObj = null;

    beforeEach(function () {
        testObj = animeDirectory.AnimeDirectoryFactory();
    });

    it('should create a new anime directory object', function () {
        var animeDirectoryOne = animeDirectory.AnimeDirectoryFactory();
        var animeDirectoryTwo = animeDirectory.AnimeDirectoryFactory();
        expect(animeDirectoryOne).toEqual(animeDirectoryTwo);
    });

    it('should attempts to get the path stats', function () {
        spyOn(testObj, 'getPathStats').andCallThrough();
        testObj.readPath();
        expect(testObj.getPathStats).toHaveBeenCalled();
    });

    it('should return a promise object when reading the file path', function () {
        var promise = testObj.readPath();
        expect(typeof promise).toBe('object');
        expect(typeof promise.then).toBe('function');
    });

    it('should return a resolved promise object after reading the file', function (done) {
        var orig = testObj.readPath();
        setTimeout(function () {
            expect(orig).not.toEqual(testObj.readPath());
            done();
        }, 100);
    });

    it('should have the filename list', function (done) {
        testObj.readPath();
        setTimeout(function () {
            var model = testObj.collection.at(10).get('filenames');
            expect(typeof model).toBe('object');
            done();
        }, 100);
    });

    it('should have episode model collections', function (done) {
        testObj.readPath();
        setTimeout(function () {
            var model = testObj.collection().findWhere({name: "Kill la Kill"});
            expect(model.get('episode_collection')).toBe('object');
            done();
        }, 100)
    });
});
