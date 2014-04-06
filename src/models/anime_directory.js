/**
 * Created by nathan on 3/20/14.
 */
"use strict";
var q = require('q'),
    FILE_PATH = require('../config').media_dir,
    fs = require('fs'),
    async = require('async');

function AnimeDirectory() {
    this.collection = [];
}

AnimeDirectory.prototype.readPath = function () {
    var self = this;
    var deferred = q.defer();

    if (self.collection.length > 0) {
        deferred.resolve(null);
    }

    var files = fs.readdirSync(FILE_PATH).map(function (item) {
        return FILE_PATH + "/" + item;
    });

    self.getPathStats(files).then(function (collection) {
        self.collection.push(collection.filter(function (element) {
            return element !== undefined;
        }).filter(function (element) {
            return element.filenames.every(function (filename) {
                return self.isAnime(filename);
            });
        }));
        async.each(self.collection[0], function (item, next) {
            item.save(function (err) {
                if (err) {
                    console.log(err);
                }
                console.log("Saved: " + item.title);
            });
            next();
        }, function () {
            deferred.resolve(null);
        });
    });

    return deferred.promise;
};

AnimeDirectory.prototype.getPathStats = function (filePath) {
    var deferred = q.defer();
    var addToCollection = function (item, callback) {
        fs.lstat(item, function (err, stat) {
            if (stat.isDirectory()) {
                var show = item.split("/").pop();
                var Anime = require('./anime');
                var model = new Anime({ title: show, filepath: item });
                model.setLowerCase();
                if (model !== undefined) {
                    callback(null, model);
                } else {
                    callback(null);
                }
            } else {
                callback();
            }
        });
    };
    var readAnimeDirFiles = function (model, done) {
        fs.readdir(model.filepath, function (err, files) {
            async.each(files, function (file, next) {
                model.filenames.push(file);
                next(null);
            }, function () {
                done(null);
            });
        });
    };

    async.waterfall([
        function (next) {
            async.map(filePath, addToCollection, function (err, models) {
                models = models.filter(function (item) {
                    return item !== undefined;
                });
                next(null, models);
            });
        },
        function (models, done) {
            async.each(models, function (model, callback) {
                readAnimeDirFiles(model, callback);
            }, function () {
                done(null, models)
            });
        }
    ], function (err, result) {
        if (err) {
            console.log(err);
        }
        deferred.resolve(result);
    });

    return deferred.promise;
};

AnimeDirectory.prototype.isAnime = function (string) {
    var findSub = string.match(/^\[/i);
    if (findSub !== null && findSub.length > 0) {
        var fileType = string.split('.').pop();
        switch (fileType) {
            case 'mkv':
            case 'mp4':
                return true;
            default:
                return false;
        }
    } else {
        return false;
    }
};

exports.AnimeDirectoryFactory = function () {
    return new AnimeDirectory();
};

exports.AnimeFactory = function (params) {
    return new Anime(params);
};

