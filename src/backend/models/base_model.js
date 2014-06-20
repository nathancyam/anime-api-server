/**
 * Base Models
 */
/*jslint node: true */
"use strict";

var sqlite3 = require('sqlite3').verbose();
var _ = require('lodash'),
    squel = require('squel');
var dbLocation = require('../config').dbConnections.sqlite;

var db = new sqlite3.Database(dbLocation);

/**
 * Base model that gives the ability to interact with the database and their tables/models
 * @type {BaseModel}
 */
var BaseModel = module.exports = function BaseModel() {
    this.table = null;
    this.schema = {};
    this._isLoaded = null;
    this._data = {};

    this.hasMany = null;

    /**
     * Constructs the parametrised statements
     * @param params
     * @returns Array
     * @protected
     */
    this.constructStatement = function (params) {
        var keys = _.keys(params),
            values = _.values(params);

        keys = keys.map(function (e) {
            return e + ' = ?';
        });

        if (keys.length > 1) {
            keys = keys.join(" AND ");
        } else {
            keys = keys.toString();
        }

        var stmtArray = [keys];

        values.forEach(function (e) {
            stmtArray.push(e);
        });

        return stmtArray;
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
        var whereCondition = this.constructStatement(params);

        var stmtObj = squel.select().from(this.table);
        stmtObj = stmtObj.where.apply(stmtObj, whereCondition).toParam();

        return db.all(stmtObj.text, stmtObj.values, callback);
    },
    /**
     * Find a model with the ID specified.
     * @param id
     * @param callback
     */
    findById: function (id, callback) {
        id = parseInt(id);
        this.load(id, callback);
    },
    /**
     * Save the model to the database. If the model was loaded previously, we update the fields that were changed.
     * If the record is new, we insert the record to the database.
     * @param callback
     * @returns {*}
     */
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
    /**
     * Loads the model from the database and assigns its properties to the model for easier access.
     * Flags the model that this is loaded.
     * @param id
     * @param callback
     */
    load: function(id, callback) {
        var self = this;

        var stmtObj = squel.select('*')
            .from(this.table)
            .where('id = ' + id)
            .toParam();

        db.get(stmtObj.text, function(err, result) {
            if (err) {
                return callback({message: 'Failed to load model'}, null);
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
