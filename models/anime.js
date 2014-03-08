var FILE_PATH = '/media/nfs/pi/shows';

var fs = require('fs');
var q = require('q');
var async = require('async');
var Backbone = require('backbone');

var Anime = Backbone.Model.extend({
    initialize: function() {
        "use strict";
        this.setLowerCase();
    },
    setLowerCase: function() {
        "use strict";
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

AnimeDirectory.prototype.readPath = function() {
    var self = this;
    var deferred = q.defer();
    var files = fs.readdirSync(FILE_PATH).map(function(item) {
        return FILE_PATH + "/" + item;
    });

    self.getPathStats(files).then(function(collection) {
        self.collection.add(collection.filter(function(element) {
            return element !== undefined;
        }));
        self.memorizeCache['collection'] = self.collection;
        deferred.resolve();
    });

    return deferred.promise;
};

AnimeDirectory.prototype.getPathStats = function (filePath) {
    var deferred = q.defer();
    var addToCollection = function(item, callback) {
        "use strict";
        fs.lstat(item, function(err, stat) {
            if (stat.isDirectory()) {
                var show = item.split("/").pop();
                var model = new Anime({ name: show });
                callback(null, model);
            } else {
                callback();
            }
        });
    };

    async.map(filePath, addToCollection, function(err, results) {
        deferred.resolve(results);
    });

    return deferred.promise;
};

exports.AnimeDirectoryFactory = function() {
    return new AnimeDirectory();
};

exports.AnimeFactory = function(params) {
    return new Anime(params);
};
