/**
 * Created by nathanyam on 13/07/2014.
 */

/* jslint node: true */
"use strict";

var moduleOptions = {};
var fs = require('fs');
var AnimeUtil = require('../models/anime_directory');
var Config = require('../config');
var NotificationMgr = require('./notifications_manager');
var Q = require('q');

exports.setOptions = function (options) {
    moduleOptions = options || {};
};

exports.watchDir = function () {
    if (!moduleOptions.watchDir) {
        throw new Error('Watch directory not defined');
    }

    fs.watch(moduleOptions.watchDir, moveDirectory);
};

exports.getWatchDirectory = function () {
    return moduleOptions.watchDir;
};

exports.attachCallback = function (func) {
    fs.watch(moduleOptions.watchDir, func);
};

function moveDirectory(event, filename) {
    var originalPath = moduleOptions.watchDir + '/' + filename;
    var fileStat = Q.denodeify(fs.stat);

    fileStat(originalPath).then(function (result) {
        if (result.isFile()) {
            if (event === 'rename') {
                // Check if the filename is a valid anime file name
                if (AnimeUtil.isAnimeFile(filename)) {
                    // If the anime is valid, then find out what series it is
                    var animeName = AnimeUtil.getAnimeName(filename);
                    var notifyObj = {
                        type: 'EPISODE_DOWNLOAD',
                        title: 'New Episode Downloaded',
                        message: 'New anime episode download finished: ' + filename
                    };

                    // If we can verify what the series was, then we should move it to the media folder
                    var animeDir = Config.media_dir + '/' + animeName;
                    var moveFile = Q.denodeify(fs.rename);

                    fileStat(animeDir).then(function (result) {
                        if (result.isDirectory()) {
                            return moveFile(originalPath, animeDir + '/' + filename);
                        }
                    }, function (err) {
                        // If we don't have the folder for this anime, we have to create the folder
                        if (err.code === 'ENOENT' && err.errno === 34) {
                            fs.mkdir(animeDir, function () {
                                return moveFile(originalPath, animeDir + '/' + filename);
                            });
                        }
                    }).then(function () {
                        NotificationMgr.emit('notification:new', notifyObj);
                    }).done();
                }
            }
        }
    });
}

exports.moveDirectory = moveDirectory;
