/**
 * Created by nathanyam on 25/04/2014.
 */
var http = require('http'),
    qs = require('querystring'),
    url = require('url');

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

    // Make the call
    var req = http.request({
        hostname: urlObject.hostname,
        path: urlObject.path,
        method: 'GET',
        auth: 'kyokushin_nanaya:9Mn6iJGrupfw.HMDxhX0XKQgL2BiSKUEtif/DQSq'
    }, function (res) {
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });
        res.on('end', function () {
            var prefix = urlObject.protocol + '//' + urlObject.hostname;
            var images = JSON.parse(responseString).reduce(function (prev, curr) {
                prev.push(prefix + curr.file_url);
                return prev;
            }, []);
            done(null, images);
        });
    }).on('error', function (err) {
        console.log(err.message);
        console.log(err.stack);
        done(err, null);
    });

    req.end();
};