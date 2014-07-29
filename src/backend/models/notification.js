/**
 * Created by nathan on 7/29/14.
 */

var Mongoose = require('mongoose'),
    Schema = Mongoose.Schema;

var NotificationSchema = new Schema({
    type: String,
    message: String,
    timestamp: Number
});

module.exports = Mongoose.model('Notification', NotificationSchema);
