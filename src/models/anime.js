"use strict";
var app_config = require('../config').app_config;

var FILE_PATH = app_config.media_dir,
    fs = require('fs'),
    q = require('q'),
    async = require('async'),
    Backbone = require('backbone');

var Anime = Backbone.Model.extend({
    defaults: function () {
        return {
            "episode_collection": new EpisodeCollection(),
            "filenames": []
        }
    },
    initialize: function () {
        this.setLowerCase();
    },
    setLowerCase: function () {
        this.set({normalizedName: this.get('name').replace(/\W/g, '').toLowerCase()});
    },
    fillEpisodeCollection: function () {
        var self = this;
        var fileNames = this.get('filenames');

        fileNames.forEach(function (file) {
            var ep = new Episode({ fileString: file });
            self.get('episode_collection').add(ep);
        });
    }
});

var Episode = Backbone.Model.extend({
    initialize: function () {
        this.getSubgroup();
        this.getEpisodeNum();
    },
    getSubgroup: function () {
        var regexp = /^\[(.*?)]/gi;
        if (this.isAnime()) {
            var match = this.get('fileString').match(regexp);
            if (match !== undefined && match !== null) {
                this.set({ subGroup: match.pop() });
            }
        }
    },
    getEpisodeNum: function () {
        var regexp = /\d\d/;
        if (this.isAnime()) {
            var match = this.get('fileString').match(regexp);
            if (match !== undefined && match !== null) {
                this.set({ episodeNum: match.pop() });
            }
        }
    },
    isAnime: function () {
        var fileName = this.get('fileString');
        return fileName.split('.').pop() === 'mkv' && fileName.match(/\[(.*?)]/gi) !== undefined;
    }
});

var EpisodeCollection = Backbone.Collection.extend({ model: Episode });
var AnimeCollection = Backbone.Collection.extend({ model: Anime });

function AnimeDirectory() {
    this.collection = new AnimeCollection();
    this.memorizeCache = {};
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
        self.collection.add(collection.filter(function (element) {
            return element !== undefined;
        }).filter(function (element) {
            return element.get('filenames').every(function (filename) {
                return self.isAnime(filename);
            });
        }));
        deferred.resolve(null);
    });

    return deferred.promise;
};

AnimeDirectory.prototype.getPathStats = function (filePath) {
    var deferred = q.defer();
    var addToCollection = function (item, callback) {
        fs.lstat(item, function (err, stat) {
            if (stat.isDirectory()) {
                var show = item.split("/").pop();
                var model = new Anime({ name: show, file_path: item });
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
        fs.readdir(model.get('file_path'), function (err, files) {
            async.each(files, function (file, next) {
                model.get('filenames').push(file);
                next(null);
            }, function () {
                model.fillEpisodeCollection();
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
        },
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
