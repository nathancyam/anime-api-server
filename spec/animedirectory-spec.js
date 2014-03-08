var assert = require('assert');

var animeDirectory = require('../models/anime');

describe('Reading file paths', function() {
    var testObj = null;

    beforeEach(function() {
        testObj = animeDirectory.AnimeDirectoryFactory();
    });

    it('should create a new anime directory object', function() {
        var animeDirectoryOne = animeDirectory.AnimeDirectoryFactory();
        var animeDirectoryTwo = animeDirectory.AnimeDirectoryFactory();
        expect(animeDirectoryOne).toEqual(animeDirectoryTwo);
    });

    it('should attempts to get the path stats', function() {
        spyOn(testObj, 'getPathStats').andCallThrough();
        testObj.readPath();
        expect(testObj.getPathStats).toHaveBeenCalled();
    });

    it('should return a promise object', function() {
        var promise = testObj.readPath();
        expect(typeof promise).toBe('object');
        expect(typeof promise.then).toBe('function');
    });

    it('should return a promise object which is resolved', function(done) {
        var orig = testObj.readPath();
        setTimeout(function() {
            expect(orig).not.toEqual(testObj.readPath());
            done();
        }, 1);
    });
});

describe('Anime Backbone Model', function() {
    var animeObj = null;

    beforeEach(function() {
        animeObj = animeDirectory.AnimeFactory({ name: 'Test Name'});
    });

    it('should have a name attribute on construction', function() {
        expect(animeObj.get('name')).toEqual('Test Name');
    });

    it('should have a normalised name on construction', function() {
        expect(animeObj.get('normalizedName')).toEqual('testname');
    })
});
