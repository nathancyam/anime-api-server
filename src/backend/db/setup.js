/**
 * Created by nathanyam on 2/06/2014.
 */


var sqlite3 = require('sqlite3').verbose();
var dbLocation = require('../config').dbConnections.sqlite;

var db = new sqlite3.Database(__dirname + '/anime.db');

(function () {
    db.serialize(function () {
        db.run(
                "CREATE TABLE IF NOT EXISTS anime(" +
                "id INTEGER PRIMARY KEY," +
                "title TEXT," +
                "normalizedName TEXT," +
                "filePath TEXT," +
                    "designated_subgroup TEXT," +
                "ann_id INTEGER," +
                "is_watching INTEGER," +
                "is_complete INTEGER)"
        );

        db.run(
                "CREATE TABLE IF NOT EXISTS subgroups(" +
                "id INTEGER PRIMARY KEY," +
                "name TEXT)"
        );

        db.run(
                "CREATE TABLE IF NOT EXISTS episodes(" +
                "id INTEGER PRIMARY KEY," +
                "anime_id INTEGER," +
                "filePath TEXT," +
                "fileName TEXT," +
                "subgroup_id TEXT," +
                "is_anime INTEGER," +
                "FOREIGN KEY(anime_id) REFERENCES anime(id)," +
                "FOREIGN KEY(subgroup_id) REFERENCES subgroups(id))"
        );
    });
    db.close();
})();
