/**
 * Created by nathan on 3/20/14.
 */
/*jslint node:true*/
"use strict";
var FILE_PATH = require('../config').media_dir,
    Anime = require('./anime'),
    Episode = require('./episode'),
    fs = require('fs'),
    async = require('async');

/**
 * Reads the directory specified in the configuration
 * Returns an array containing the directory.
 * This is a synchronous function and will halt other processes
 * @returns {*}
 */
function readDirectory() {
    return fs.readdirSync(FILE_PATH).map(function (item) {
        return FILE_PATH + "/" + item;
    });
}

/**
 * Creates the Anime model. To be used with the Async library.
 * Calls the callback to indicate to proceed with the next iteration
 * @param item
 * @param callback
 */
function createAnimeModels(item, callback) {
    fs.lstat(item, function (err, stat) {
        if (stat !== undefined && stat.isDirectory()) {
            var show = item.split("/").pop();
            var animeModel = new Anime({ title: show, filepath: item });
            animeModel.setLowerCase();
            Anime.find({ normalizedName: animeModel.normalizedName }, function (err, dbResult) {
                if (animeModel && dbResult.length === 0) {
                    callback(null, animeModel);
                } else {
                    callback(null);
                }
            });
        } else {
            callback();
        }
    });
}

/**
 * Save the Anime model and calls the callback when saved successfully.
 * @param animeModel
 * @param callback
 */
function saveAnimeModel(animeModel, callback) {
    isAnime(animeModel.filepath, function (anime) {
        if (anime) {
            animeModel.isAnime = true;
            animeModel.save(function () {
                callback();
            });
        } else {
            callback();
        }
    });
}

/**
 * Create the Episode model. To be used with the Async library
 * Call the callback to indicate to the process has finished
 * @param animeModel
 * @param done
 */
function createEpisodeModels(animeModel, done) {
    fs.readdir(animeModel.filepath, function (err, files) {
        async.each(files, function (file, next) {
            var episode = new Episode({
                filePath: animeModel.filepath + '/' + file,
                anime: animeModel.id
            });
            isAnime(animeModel.filepath, function (result) {
                if (result) {
                    episode.isAnime = true;
                    episode.getEpisodeNumber();
                }
                episode.save(function () {
                    next(null);
                });
            });
        }, function () {
            done(null);
        });
    });
}

/**
 * Checks a directory's contents and goes through each file to verify they are all anime
 * TODO: This doesn't work with Girls Und Panzer. I blame cuttlefish
 * @param directory
 * @param callback
 */
function isAnime(directory, callback) {
    fs.readdir(directory, function (err, files) {
        async.every(files, isAnimeFilename, callback);
    });
}

/**
 * Checks if a filename is anime related by regex
 * @param string
 * @returns {boolean}
 */
function isAnimeFilename(string, done) {
    var findSub = string.match(/^\[/i),
        isAnime = false;
    if (findSub !== null && findSub.length > 0) {
        var fileType = string.split('.').pop();
        switch (fileType) {
            case 'mkv':
            case 'mp4':
                isAnime = true;
                break;
            default:
                break;
        }
    }
    done(isAnime);
}

/**
 * Initialisation
 * @param filePath
 * @param callback
 */
function init(filePath, callback) {
    async.waterfall([
        function (next) {
            async.map(filePath, createAnimeModels, function (err, models) {
                var animeModels = models.filter(function (item) {
                    return item !== undefined;
                });
                // Return an array of Anime models to be parsed.
                next(null, animeModels);
            });
        },
        function (models, done) {
            async.each(models, createEpisodeModels, function () {
                done(null, models);
            });
        }
    ], function (err, models) {
        if (err) console.log(err);
        callback(models);
    });
}

function refreshEpisodes(callback) {
    var Episode = require('./episode');
    Episode.sync(callback);
}

/**
 * Generates the Anime and Episode models
 * @param callback
 */
exports.generateModels = function (callback) {
    var files = readDirectory();
    init(files, function (models) {
        async.each(models, saveAnimeModel, function () {
            refreshEpisodes(callback);
        });
    });
};
