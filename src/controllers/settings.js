/**
 * Created by nathanyam on 26/04/2014.
 */

var config = require('../config');

exports.setSettings = function (req, res) {
    var data = req.body;
    console.log(data);
    res.json(data);
};
