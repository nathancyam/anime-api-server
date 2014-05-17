/**
 * Created by nathanyam on 25/04/2014.
 */

/*jslint node:true*/
"use strict";

var http = require('http'),
    qs = require('querystring'),
    url = require('url'),
    request = require('request');

/**
 * Set up the main class
 * @type {exports}
 */
var Danbooru = module.exports = function (options) {
    options = options || {};

    this.baseUrl = options.baseUrl || 'http://danbooru.donmai.us/';
    this.username = options.username;
    this.password = options.password;

    this.limit = options.imageLimit || 5;
    this.isSafe = options.isSafe || true;

    this.getImageURI = 'posts.json';
};

/**
 * Gets the images from danbooru
 * @param searchTerms
 * @param done
 */
Danbooru.prototype.getImages = function (searchTerms, done) {
    searchTerms = searchTerms || [];

    var queryObject = {
        limit: this.limit,
        tags: this.isSafe ? ['rating:safe'] : []
    };

    // Format the tags
    searchTerms = searchTerms.map(function (e) {
        return e.replace(/ /g, "_");
    });

    // Put the tags together
    queryObject.tags = queryObject.tags.concat(searchTerms).join(' ');

    var requestUrl = this.baseUrl + this.getImageURI + '?' + qs.stringify(queryObject),
        urlObject = url.parse(requestUrl);

    var userAuth = {
        auth: {
            user: 'kyokushin_nanaya',
            pass: '9Mn6iJGrupfw.HMDxhX0XKQgL2BiSKUEtif/DQSq',
            sendImmediately: true
        }
    };

    // Make the call
    request(urlObject, userAuth, function (err, response, data) {
        var prefix = urlObject.protocol + '//' + urlObject.hostname;
        var images = JSON.parse(data).reduce(function (prev, curr) {
            prev.push(prefix + curr.file_url);
            return prev;
        }, []);
        done(null, images);
    });
};
