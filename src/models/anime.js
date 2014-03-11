"use strict";

var FILE_PATH = '/media/nfs/pi/shows',
    fs = require('fs'),
    q = require('q'),
    async = require('async'),
    Backbone = require('backbone');

var Anime = Backbone.Model.extend({
    defaults: function () {
        return {
            "subgroup": '',
            "episode_array": [],
            "episode_num": '',
            "checksum": ''
        }
    },
    initialize: function () {
        this.setLowerCase();
    },
    setLowerCase: function () {
        this.set({normalizedName: this.get('name').replace(/\W/g, '').toLowerCase()});
    }
});

var AnimeCollection = Backbone.Collection.extend({
    model: Anime
});

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
                model.get('episode_array').push(file);
                next(null);
            }, function () {
                done(null);
            });
        });
    };

    async.map(filePath, addToCollection, function (err, models) {
        models = models.filter(function (item) {
            return item !== undefined;
        });
        async.each(models, function (model, callback) {
            readAnimeDirFiles(model, callback);
        }, function () {
            deferred.resolve(models);
        });
    });

    return deferred.promise;
};

exports.AnimeDirectoryFactory = function () {
    return new AnimeDirectory();
};

exports.AnimeFactory = function (params) {
    return new Anime(params);
};
