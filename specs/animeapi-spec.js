/**
 * Created by nathanyam on 14/04/2014.
 */

var expect = require('chai').expect,
    animeApi = require('../src/helpers/anime_api')({});

describe('Anime API interface', function() {
    describe('#parseXMLResult()', function () {
        it('should parse some XML', function () {
            var result = animeApi.parseXMLResult('<example>Test</example>');
            expect(result).to.be.a('object');
            expect(result).to.have.property('example');
            expect(result.example).to.equal('Test');
        });
    });
});