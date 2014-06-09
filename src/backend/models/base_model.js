/**
 * Base Models
 */

var sqlite3 = require('sqlite3').verbose();
var _ = require('lodash'),
    squel = require('squel');
var dbLocation = require('../config').dbConnections.sqlite;

var db = new sqlite3.Database(dbLocation);

var BaseModel = module.exports = function BaseModel() {
    this.table = null;
    this.schema = {};
    this._isLoaded = null;
    this._data = {};

    var _constructStatement = function(sqlOperator, params) {
        var keys = _.keys(params),
            values = _.values(params);

        sqlOperator = sqlOperator.toUpperCase();

        var whereStmt = keys.reduce(function(prev, curr) {
            return prev + ' ' + curr + ' = ?';
        }, sqlOperator);

        return [whereStmt, values];
    };

    this.constructWhere = function(params) {
        params = params || this._data;
        return _constructStatement('WHERE', params);
    };

    this.populateData = function() {
        var schemaKeys = _.keys(this.schema),
            self = this;

        /**
         * Populate the _data object with the ones from the schema
         */
        schemaKeys.forEach(function(e) {
            if (self[e]) {
                self._data[e] = self[e];
            }
        });

        return this;
    };
};

BaseModel.prototype = {
    /**
     * Find a model with the params specified.
     * @param params
     * @param callback
     */
    find: function(params, callback) {
        var whereCondition = this.constructWhere(params),
            fields = whereCondition[0],
            values = whereCondition[1];

        return db.all('SELECT * FROM ' + this.table + ' ' + fields, values, callback);
    },
    save: function(callback) {
        this.populateData();
        var stmtObj = {};

        // If the model has been loaded from the database, we are doing an update, not an insert
        if (this._isLoaded) {
            stmtObj = squel.update()
                .table(this.table)
                .setFields(this._data)
                .toParam();
        } else {
            stmtObj = squel.insert()
                .into(this.table)
                .setFields(this._data)
                .toParam();
        }

        if (callback) {
            return db.run(stmtObj.text, stmtObj.values, callback);
        } else {
            return db.run(stmtObj.text, stmtObj.values);
        }
    },
    load: function(id, callback) {
        var self = this;

        var stmtObj = squel.select('*')
            .from(this.table)
            .where('id = ' + id)
            .toParam();

        db.get(stmtObj.text, function(err, result) {
            if (err) {
                callback({message: 'Failed to load model'}, null);
            }

            // Inform that this model has been loaded.
            self._isLoaded = true;

            // Attach the model's attribute to the BaseModel
            _.extend(self, result);
            _.extend(self._data, result);
            return callback(null, self);
        });
    }
};
