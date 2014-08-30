/**
 * Created by nathan on 7/29/14.
 */

"use strict";
/* jslint node: true */

var util = require("util");
var events = require("events");
var Notification = require('../models/notification');
var Socket = require('./socket_handler');
var _ = require('lodash');

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
    var simpleNotify = _.assign(data, { timestamp: new Date().getTime() });

    simpleNotify.msg = simpleNotify.message;

    // Check if the notification data is valid
    if (!data) {
        throw new Error('Data undefined');
    }
    if (!data.type || !data.message) {
        throw new Error('Invalid data format');
    }

    notify.type = data.type;
    notify.msg = data.message;
    notify.timestamp = new Date().getTime();
    notify.save(function (err) {
        if (err) {
            console.log(err.message);
        }
        Socket.emit('notify:new', simpleNotify);
    });
};

NotificationManager.prototype.clear = function (data) {
    Notification.collection.remove();
};

var notify = module.exports = new NotificationManager();

notify.on("notification:new", function (data) {
    notify.add(data);
});
