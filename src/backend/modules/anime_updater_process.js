/*jslint node: true */
"use strict";

var request = require('request');

process.on('message', function (msg) {
    console.log('Sending http request...');
    request('http://localhost:3000/anime/update?push=true', function (err, res, body) {
        process.send(body);
    });
});
