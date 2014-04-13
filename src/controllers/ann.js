/**
 * Created by nathan on 3/16/14.
 */

var ann = require('../helpers/ann');

exports.search = function (req, res) {
    var animeName = req.query.name;

    ann.searchByName(animeName, function (err, apiResponse) {
        if (!err) {
            res.send(apiResponse);
        }
    })
};

exports.searchById = function (req, res) {
    var id = req.params.id;

    ann.searchById(id, function (err, apiResponse) {
        if (!err) {
            res.json(apiResponse);
        }
    })
};