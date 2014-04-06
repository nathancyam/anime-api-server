/**
 * Created by nathan on 3/16/14.
 */

var mal = require('../helpers/mal');

exports.search = function (req, res) {
    var animeName = req.query.name;

    mal.search(animeName, function (err, apiResponse) {
        if (!err) {
            res.send(apiResponse);
        }
    })
};