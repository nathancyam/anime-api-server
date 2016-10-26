/**
 * Created by nathan on 7/29/14.
 */

var Mongoose = require('mongoose'),
    Schema = Mongoose.Schema;

Mongoose.Promise = global.Promise;

var NotificationSchema = new Schema({
    type: String,
    msg: String,
    timestamp: Number
});

module.exports = Mongoose.model('Notification', NotificationSchema);
