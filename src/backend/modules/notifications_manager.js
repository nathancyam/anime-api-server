/**
 * Created by nathan on 7/29/14.
 */

"use strict";
/* jslint node: true */

var util = require("util");
var events = require("events");
var Notification = require('../models/notification');

/**
 * @constructor
 */
function NotificationManager() {
    events.EventEmitter.call(this);
}

util.inherits(NotificationManager, events.EventEmitter);

/**
 * Adds notification to persistence layer
 * @param data
 */
NotificationManager.prototype.add = function (data) {
    var notify = new Notification();

    // Check if the notification data is valid
    if (!data.type || !data.message) {
        throw new Error('Invalid data format');
    }

    notify.type = data.type;
    notify.message = data.message;
    notify.timestamp = new Date().getTime();
    notify.save();
};

var notify = module.exports = new NotificationManager();

notify.on("add_notification", function (data) {
    notify.add(data);
});

