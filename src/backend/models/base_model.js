/**
 * Base Models
 */

var sqlite3 = require('sqlite3').verbose();
var _ = require('lodash');
var dbLocation = require('../config').dbConnections.sqlite;

var db = new sqlite3.Database(dbLocation);

var BaseModel = module.exports = function BaseModel() {
    this.table = null;

    this.constructWhere = function(params) {
        var keys = _.keys(params),
            values = _.values(params);

        var whereStmt = keys.reduce(function(prev, curr) {
            return prev + ' ' + curr + ' = ?';
        }, 'WHERE');

        return [whereStmt, values];
    };
};

BaseModel.prototype = {
    /**
     * Find a model with the params specified.
     * @param params
     */
    find: function(params, callback) {
        var whereStmt = this.constructWhere(params),
            fields = whereStmt[0],
            values = whereStmt[1];

        return db.all('SELECT * FROM ' + this.table + ' ' + fields, values, callback);
    }
};



