/**
 * My Anime List API module
 */

"use strict";
var Cache = require('../models/cache');
var MyAnimeList = (function () {

    var mal_user = require('../config').mal_username,
        mal_pw = require('../config').mal_password;
    var options = {
        host: 'myanimelist.net',
        auth: mal_user + ':' + mal_pw
    };

    var cleanUpAnimeName = function (animeName) {
        return animeName.replace(/\W/gi, ' ').replace(/\s/gi, '+');
    };

    return {
        search: function (animeName, done) {
            var self = this;
            var http = require('http'),
                searchFriendlyName = cleanUpAnimeName(animeName),
                searchUri = '/api/anime/search.xml?q=';

            options.path = searchUri + searchFriendlyName;

            if (Cache.has(searchFriendlyName)) {
                done(null, Cache.get(searchFriendlyName));
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
                        jsonResult = self.parseMalResult(apiResponse.data);
                        Cache.set(searchFriendlyName, jsonResult);
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
        parseMalResult: function (result) {
            var parser = require('xml2js').Parser(),
                parseResult = '';
            parser.parseString(result, function (err, results) {
                parseResult = results;
            });
            return parseResult;
        }
    }
})();

module.exports = MyAnimeList;
