/**
 * Created by nathanyam on 13/04/2014.
 */
/*jslint node: true*/
"use strict";
var Cache = require('../modules/cache'),
    events = require('events'),
    util = require('util'),
    url = require('url'),
    request = require('request'),
    qs = require('querystring'),
    http = require('http'),
    _ = require('lodash');

//TODO: Attach callbacks when a response is received from the relevant services

/**
 * @constructor
 * @type {exports}
 */
var AnimeAPI = module.exports = function (options, parsers) {
    events.EventEmitter.call(this);

    this.options = options || {};
    this.parsers = parsers || [];
};

util.inherits(AnimeAPI, events.EventEmitter);

/**
 * @param {Object} searchObj - query
 * @param {AnimeAPI~searchCallback} done - The callback that handles the formatted results.
 */
AnimeAPI.prototype.search = function (searchObj, done) {
    var self = this,
        parsers = this.parsers,
        hasQuery = true,
        searchUrlObj = '';

    // If a search object is actually a callback, we should still make the HTTP request.
    if (typeof searchObj === 'function' && !done) {
        hasQuery = false;
        done = searchObj;
    }

    if (this.options.url === undefined) {
        done({ message: 'You need to specify a search URL'}, null);
    }

    // We need to check if the URL is a query to its relevant service
    if (this.options.url.indexOf('?') !== -1) {
        searchUrlObj = url.parse(this.options.url + '&' + qs.stringify(searchObj));
    } else if (hasQuery) {
        searchUrlObj = url.parse(this.options.url + '?' + qs.stringify(searchObj));
    } else {
        searchUrlObj = url.parse(this.options.url);
    }

    if (!searchUrlObj.query) {
        searchUrlObj.query = searchObj;
    }

    request(url.format(searchUrlObj), function (err, response, body) {
        if (err) {
            throw err;
        }
        var jsonResult = self.parseXMLResult(body);
        if (parsers) {
            parsers.map(function (element) {
                element.apply(jsonResult);
            });
        }
        jsonResult.searchQuery = searchObj;
        self.emit('api_request_complete', jsonResult);
        done(null, jsonResult);
    });
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

/**
 * This is the callback to handle the search results
 * @callback AnimeAPI~searchCallback
 * @param {Object} Error Object
 * @param {Object} Result object
 */

function cleanUpAnimeName(animeName) {
    return animeName.replace(/\W/gi, ' ');
}
