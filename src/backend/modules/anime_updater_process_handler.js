/*jslint node: true */
"use strict";

var cp = require('child_process');

var child = cp.fork(__dirname + '/anime_updater_process.js');

setInterval(function () {
    child.send('start');
    child.on('message', function (m) {
        console.log(m);
    });

}, 30000);
