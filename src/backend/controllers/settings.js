/**
 * Created by nathanyam on 26/04/2014.
 */

var Settings = require('../models/settings');

exports.setSettings = function (req, res) {
    var data = req.body;
    Settings.init(data);
    res.json(data);
};

exports.getSettings = function (req, res) {
    res.json(Settings.all());
};
