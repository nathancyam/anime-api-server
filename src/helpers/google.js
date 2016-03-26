/**
 * Created by nathanyam on 25/04/2014.
 */

const https = require('https');
const url = require('url');

/**
 * @constructor
 * @type {exports}
 */
var GoogleSearch = module.exports = function (config) {
  const apiKey = config.custSearchAPI;
  const cx = config.custSearchCX;
  this.requestUrl = `https://www.googleapis.com/customsearch/v1?googlehost=google.com&key=${apiKey}&cx=${cx}&q=`;
};

/**
 * @param {Object} searchTerm
 * @param {Function} done
 */
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
