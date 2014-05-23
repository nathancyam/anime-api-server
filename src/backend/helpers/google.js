/**
 * Created by nathanyam on 25/04/2014.
 */


var Settings = require('../modules/settings').all();
var CX = Settings.google.custSearchCX;
var API_KEY = Settings.google.custSearchAPI;

var https = require('https'),
    url = require('url');

var GoogleSearch = module.exports = function () {
    this.requestUrl = "https://www.googleapis.com/customsearch/v1?googlehost=google.com&key=" + API_KEY + "&cx=" + CX + "&q=";
};

GoogleSearch.prototype.searchAnime = function (searchTerm, done) {
    var requestUrl = this.requestUrl + searchTerm;
    var request = https.request(url.parse(requestUrl), function (res) {
        var responseStr = '';
        res.on('data', function (chunk) {
            responseStr += chunk;
        });
        res.on('end', function () {
            done(null, JSON.parse(responseStr));
        });
    });
    request.end();
};
