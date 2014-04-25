/**
 * Created by nathanyam on 13/04/2014.
 */

"use strict";
var Cache = require('../models/cache'),
    qs = require('querystring');

var AnimeAPI = module.exports = function (options, parsers) {

    var cleanUpAnimeName = function (animeName) {
        return animeName.replace(/\W/gi, ' ');
    };

    return {
        search: function (options, done) {
            var self = this,
                http = require('http');

            if (options.query !== undefined) {
                options.path += qs.stringify(options.query);
            }

            var request = http.request(options, function (apiResponse) {
                apiResponse.setEncoding('binary');
                apiResponse.data = '';
                apiResponse.on('data', function (chunk) {
                    apiResponse.data += chunk;
                });
                apiResponse.on('end', function () {
                    var jsonResult = '';
                    if (apiResponse.data === 'No results') {
                        jsonResult = 'No results';
                    } else {
                        jsonResult = self.parseXMLResult(apiResponse.data);
                        if (parsers !== undefined) {
                            parsers.map(function (element) {
                                element.apply(jsonResult);
                            });
                        }
                    }
                    done(null, jsonResult);
                });
            }).on('error', function (err) {
                console.log(err.message);
                console.log(err.stack);
                done(err, null);
            });

            request.end();
        },
        searchByName: function (animeName, done) {
            if (animeName !== undefined) {
                var searchFriendlyName = cleanUpAnimeName(animeName),
                    nameQuery = options.search.name,
                    self = this;

                options.query[nameQuery] = searchFriendlyName;

                self.search(options, done);
            }
        },
        parseXMLResult: function (result) {
            var parser = require('xml2js').Parser(),
                parseResult = '';
            parser.parseString(result, function (err, results) {
                parseResult = results;
            });
            return parseResult;
        }
    }
};
