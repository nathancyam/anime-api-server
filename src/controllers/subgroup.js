/**
 * Created by nathanyam on 12/04/2014.
 */

var Subgroup = require('../models/subgroup');

exports.list = function (req, res) {
    Subgroup.find(function (err, results) {
        res.json(results);
    });
};
