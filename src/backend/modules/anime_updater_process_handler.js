/*jslint node: true */
"use strict";

var cp = require('child_process'),
    server = require('../server');

/**
 * The number of minutes used to query the app.
 * @type {exports.updater.updateInterval|*}
 */
var TIME_INTERVAL = require('../config').updater.updateInterval;

/**
 * Variable containing the process
 * @type {null | object}
 */
var child = null;

/**
 * Returns a module that allows you to control the process that hits the anime server
 * @constructor
 * @type {exports}
 */
var AnimeUpdaterProcessHandler = module.exports = function (options) {
    var MINUTE = 60000;
    var intervalProcess = null;
    options = { timeInterval: TIME_INTERVAL * MINUTE };

    return {
        /**
         * Starts the updater process
         * @return {boolean} Returns true if the process was successfully connected.
         */
        startProcess: function () {
            child = cp.fork(__dirname + '/anime_updater_process.js');
            intervalProcess = setInterval(function () {
                child.send('start');
            }, options.timeInterval);

            child.on('message', function (m) {
                console.log(m);
            });

            return child.connected;
        },
        /**
         * Kills the interval timer & updater process using SIGTERM. Returns if killing these process were successful.
         * @returns {boolean} Returns true if the process was successfully killed.
         */
        killProcess: function () {
            if (intervalProcess && child) {
                try {
                    clearInterval(intervalProcess);
                    child.kill();
                } catch (err) {
                    console.log(err);
                    return false;
                }
                return true;
            }
        },
        /**
         * Getter for the child process object
         * @returns {null|Object}
         */
        getProcess: function () {
            if (child) {
                return child;
            }
        }
    };
};

server.on('SIGTERM', function () {
    // Kill the child/worker process
    console.log('Killed child processes');
    child.exit();

    // Kill this process
    console.log('Kill handler processes');
    process.exit();
});
