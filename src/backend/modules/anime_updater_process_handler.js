/*jslint node: true */
"use strict";

var cp = require('child_process'),
    server = require('../server');

var child = cp.fork(__dirname + '/anime_updater_process.js'),
    timeInterval = parseInt(process.argv[2]);

setInterval(function () {
    child.send('start');
    child.on('message', function (m) {
        console.log(m);
    });
}, timeInterval);

server.on('SIGTERM', function() {
    // Kill the child/worker process
    console.log('Killed child processes');
    child.exit();

    // Kill this process
    console.log('Kill handler processes');
    process.exit();
});
