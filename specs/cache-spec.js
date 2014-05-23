/**
 * Created by nathan on 3/17/14.
 */

var cache = require('../src/backend/modules/cache');
var expect = require('chai').expect;

describe("Cache", function () {
    describe('#has()', function () {
        it('should return false when the key does not exist', function () {
            var results = cache.has('nosuchkey');
            expect(results).to.equal(false);
        });
        it('should return true when a key exists', function () {
            cache.set('exists', 'value');
            var result = cache.has('exists');
            expect(result).to.equal(true);
        });
    });

    describe("#get()", function () {
        it('should get the cache key and its contents', function () {
            cache.set('exists', 'value');
            var result = cache.get('exists');
            expect(result).to.equal('value');
        });
        it('should return null if there is no cache key', function () {
            var result = cache.get('nothing');
            expect(result).to.equal(null);
        });
    });

    describe("#set()", function () {
        it('should set the cache key and value', function () {
            var result = cache.set('key', 'value');
            expect(cache.has('key')).to.equal(true);
            expect(cache.get('key')).to.equal('value');
            expect(result).to.equal(true);
        });
    });

    describe("#flush()", function () {
        it('should flush the cache', function () {
            cache.set('key', 'value');
            expect(cache.has('key')).to.equal(true);
            cache.flush();
            expect(cache.has('key')).to.equal(false);
        });
    });
});