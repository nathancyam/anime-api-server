/**
 * Created by nathan on 3/16/14.
 */

var mal = require('../helpers/mal');

exports.search = function (req, res) {
    var api = mal.MyAnimeListModule,
        animeName = req.query.name;
    api.search(animeName, function (err, apiResponse) {
        if (!err) {
            res.send(apiResponse);
        }
    })
};