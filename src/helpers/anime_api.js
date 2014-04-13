/**
 * Created by nathanyam on 13/04/2014.
 */

"use strict";
var Cache = require('../models/cache'),
    qs = require('querystring'),
    EventEmitter = require('events').EventEmitter;

var AnimeAPI = function (options) {
    var eventEmitter = new EventEmitter();

    var cleanUpAnimeName = function (animeName) {
        return animeName.replace(/\W/gi, ' ');
    };

    var setCacheTag = function (name) {
        if (options.cache !== undefined && options.cache.tag !== undefined) {
            return name + ' ' + options.cache.tag;
        }
    };

    eventEmitter.on('set_cache', function (value) {
        Cache.set(options.cache.key, value);
    });

    return {
        search: function (options, done) {
            var self = this,
                http = require('http');

            if (options.query !== undefined) {
                options.path += qs.stringify(options.query);
            }

            if (Cache.has(options.cache.key)) {
                done(null, Cache.get(options.cache.key));
                return;
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
                        eventEmitter.emit('set_cache', jsonResult);
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
            var searchFriendlyName = cleanUpAnimeName(animeName),
                nameQuery = options.search.name,
                cacheKey = setCacheTag(searchFriendlyName),
                self = this;

            options.query[nameQuery] = searchFriendlyName;
            options.cache.key = cacheKey;

            self.search(options, done);
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

require('util').inherits(AnimeAPI, EventEmitter);

module.exports = AnimeAPI;
