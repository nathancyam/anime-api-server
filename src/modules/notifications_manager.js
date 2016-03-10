/**
 * Created by nathan on 7/29/14.
 */

"use strict";
/* jslint node: true */

var util = require("util");
var request = require("request");
var events = require("events");
var Notification = require('../models/notification');
var Socket = require('./socket_handler');
var _ = require('lodash');

var USER_API = require('../config').notifications.pushbullet_api_key;

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

NotificationManager.prototype.callPushBullet = function (data) {
    var PUSHBULLET_URI = 'https://api.pushbullet.com/v2/pushes';

    data = _adaptPushBulletJson(data);

    request.post(PUSHBULLET_URI, {
        auth: {
            user: USER_API
        },
        json: data
    }, function (err, res, body) {
        console.log(err);
        console.log(res);
        console.log(body);
    });
};

NotificationManager.prototype.clear = function (data) {
    Notification.collection.remove();
};

var notify = module.exports = new NotificationManager();

var _adaptPushBulletJson = function _adaptPushBulletJson(data) {

    if (data.message && data.type) {
        data.body = data.message;
        data.type = 'note';
    }

    // Set the default PB JSON format
    var pushBulletDefault = {
        type: 'note',
        title: 'title',
        body: 'body'
    };

    // Get a list of the acceptable keys for PB data
    var acceptableKeys = _.keys(pushBulletDefault);
    data = _.assign(pushBulletDefault, data);

    // Remove any keys that shouldn't be a part of PB data
    _.forEach(data, function (value, key) {
        if (acceptableKeys.indexOf(key) === -1) {
            delete data[key];
        }
    });

    var isFormatted = acceptableKeys.every(function (elem) {
        return data[elem] && data[elem] !== 'undefined';
    });

    if (isFormatted) {
        return data;
    } else {
        throw new Error("Can not parse the data to a PushBullet format");
    }
};

notify.on("notification:new", function (data) {
    notify.add(data);
    notify.callPushBullet(data);
});
