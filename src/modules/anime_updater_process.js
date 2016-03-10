/*jslint node: true */
"use strict";

var request = require('request');

process.on('message', function () {
    console.log('Sending http request...');
    request('http://localhost:3000/anime/update?push=true', function () {
        process.send('Finished pushing to server.');
    });
});

