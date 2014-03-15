/**
 * My Anime List API module
 */

var MyAnimeList = (function () {

    var mal_user = require('../config').app_config.mal_username,
        mal_pw = require('../config').app_config.mal_password;
    var options = {
        host: 'myanimelist.net',
        auth: mal_user + ':' + mal_pw
    };

    var cleanUpAnimeName = function(animeName) {
        return animeName.replace(/\W/gi, ' ').replace(/\s/gi, '+');
    };

    return {
        search: function (animeName, done) {
            var self = this;
            var http = require('http'),
                searchFriendlyName = cleanUpAnimeName(animeName),
                searchUri = '/api/anime/search.xml?q=';

            options.path = searchUri + searchFriendlyName;

            var request = http.request(options, function (apiResponse) {
                apiResponse.setEncoding('binary');
                apiResponse.data = '';
                apiResponse.on('data', function (chunk) {
                    apiResponse.data += chunk;
                });
                apiResponse.on('end', function () {
                    done(null, self.parseMalResult(apiResponse.data));
                });
            }).on('error', function (err) {
                console.log(err.message);
                console.log(err.stack);
                done(err, null);
            });

            request.end();
        },
        parseMalResult: function(result) {
            var parser = require('xml2js').Parser(),
                parseResult = '';
            parser.parseString(result, function(err, results) {
                parseResult = results;
            });
            return parseResult;
        }
    }
})();

exports.MyAnimeListModule = MyAnimeList;
