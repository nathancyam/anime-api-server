/**
 * Created by nathanyam on 13/04/2014.
 */

"use strict";
var Cache = require('../models/cache'),
    events = require('events'),
    util = require('util'),
    url = require('url'),
    qs = require('querystring'),
    http = require('http'),
    _ = require('underscore');

var AnimeAPI = module.exports = function (options, parsers) {
    events.EventEmitter.call(this);

    this.options = options || {};
    this.parsers = parsers || [];
};

util.inherits(AnimeAPI, events.EventEmitter);

AnimeAPI.prototype.search = function (searchObj, done) {
    if (this.options.url === undefined) {
        done({ message: 'You need to specify a search URL'}, null);
    }
    var self = this,
        parsers = this.parsers,
        searchUrlObj = url.parse(this.options.url);

    searchUrlObj.query = _.extend(searchUrlObj.query, searchObj);

    var request = http.request(searchUrlObj, function (apiResponse) {
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
            self.emit('api_request_complete', jsonResult);
            done(null, jsonResult);
        });
    }).on('error', function (err) {
        console.log(err.message);
        console.log(err.stack);
        done(err, null);
    });

    request.end();
};

AnimeAPI.prototype.searchByName = function (animeName, done) {
    if (animeName !== undefined) {
        var nameQuery = this.options.search.name;
        this.options.query[nameQuery] = cleanUpAnimeName(animeName);
        this.search(this.options, done);
    }
};

AnimeAPI.prototype.getSearchName = function () {
    var nameQuery = this.options.search.name;
    return this.options.query[nameQuery];
};

AnimeAPI.prototype.parseXMLResult = function (result) {
    var parser = require('xml2js').Parser(),
        parseResult = '';
    parser.parseString(result, function (err, results) {
        parseResult = results;
    });
    return parseResult;
};

function cleanUpAnimeName(animeName) {
    return animeName.replace(/\W/gi, ' ');
}
