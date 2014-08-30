/**
 * Created by nathanyam on 30/08/14.
 */

var Notification = require('../models/notification');


var NotificationController = module.exports = {
    list: function (req, res) {
        Notification.find(function (err, result) {
            if (err) {
                return res.send(500, { message: err.message });
            }

            return res.json(result);
        });
    }
};
