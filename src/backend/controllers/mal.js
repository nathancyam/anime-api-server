/**
 * Created by nathan on 3/16/14.
 */

var mal = require('../resources/mal');

exports.search = function (req, res) {
    var animeName = req.query.name;

    mal.searchByName(animeName, function (err, apiResponse) {
        if (!err) {
            res.send(apiResponse);
        }
    });
};