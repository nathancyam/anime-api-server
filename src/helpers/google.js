/**
 * Created by nathanyam on 25/04/2014.
 */

var CX = '015796118140852914862:fdrsrmx7uwi';
var API_KEY = 'AIzaSyCUGeD0CdhjeEAbhovBZgkPBSZYeSOTbq0';

var https = require('https'),
    url = require('url');

var GoogleSearch = module.exports = function() {
    this.requestUrl = "https://www.googleapis.com/customsearch/v1?googlehost=google.com&key="+ API_KEY +"&cx="+ CX +"&q=";
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
