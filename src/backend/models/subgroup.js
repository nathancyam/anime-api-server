/**
 * Created by nathanyam on 12/04/2014.
 */

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Cache = require('../modules/cache');

var subGroupSchema = new Schema({
    name: String
});

subGroupSchema.statics.getSubGroupByEpisode = function (episode) {
    var fileName = episode.fileName;
    return fileName.match(/\[(.*?)\]/i);
};

subGroupSchema.statics.flushCollection = function (done) {
    Mongoose.connection.collections.subgroups.drop(function (err) {
        if (err) {
            console.log(err);
        }
        Cache.flush();
        done();
    });
};

subGroupSchema.statics.build = function (done) {
    var Episode = require('./episode');

    this.flushCollection(function () {
            Episode.find(function (err, results) {
                var groups = results.reduce(function (previousValue, currentValue) {
                    var subGroupName = currentValue.filePath.match(/\[(.*?)\]/i);
                    if (subGroupName !== undefined && subGroupName !== null) {
                        subGroupName = subGroupName.pop();
                        if (previousValue.indexOf(subGroupName) === -1) {
                            previousValue.push(subGroupName);
                        }
                    }
                    return previousValue;
                }, [])
                    .map(function (element) {
                        return {
                            name: element
                        };
                    });
                done(groups);
            });
        }
    );
};

module.exports = Mongoose.model('Subgroup', subGroupSchema);
