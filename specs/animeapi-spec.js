/**
 * Created by nathanyam on 14/04/2014.
 */

var expect = require('chai').expect,
    animeApi = require('../src/backend/resources/anime_api');

describe('Anime API interface', function () {
    describe('#parseXMLResult()', function () {
        it('should parse some XML', function () {
            var api = new animeApi({});
            var result = api.parseXMLResult('<example>Test</example>');
            expect(result).to.be.a('object');
            expect(result).to.have.property('example');
            expect(result.example).to.equal('Test');
        });
    });
});
