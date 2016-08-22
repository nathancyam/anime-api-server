/**
 * Created by nathanyam on 17/03/2016.
 */

"use strict";

const request = require('request');
const PUSHBULLET_URI = 'https://api.pushbullet.com/v2/pushes';

class PushBullet {

  /**
   * @param config
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * @param {String} action
   * @param {Object} data
   */
  emit(action, data) {
    this.callPushBullet(data);
  }

  /**
   * @param {Object} data
   * @returns {Promise}
   */
  callPushBullet(data) {
    const pushBulletOptions = {
      url: PUSHBULLET_URI,
      json: true,
      headers: {
        'Access-Token': `${this.config.notifications.pushbullet_api_key}`
      },
      body: this.toPushBullet(data)
    };

    return new Promise((resolve, reject) => {
      request.post(pushBulletOptions, (err, res, body) => {
        if (err) {
          return reject(err)
        }

        return resolve({
          response: res,
          body: body
        });
      });
    });
  }

  /**
   * @param {Object} data
   * @returns {Object}
   */
  toPushBullet(data = { type: 'note', title: 'title' }) {
    if (data.message && data.type) {
      data.body = data.message;
      data.type = 'note';
    }

    // Set the default PB JSON format
    var pushBulletDefault = {
      type: 'note',
      title: 'title',
      body: data.message ? data.message : 'body'
    };

    // Get a list of the acceptable keys for PB data
    var acceptableKeys = Object.keys(pushBulletDefault);
    data = Object.assign({}, pushBulletDefault, data);

    // Remove any keys that shouldn't be a part of PB data
    Object.keys(data).forEach(value => {
      if (!acceptableKeys.includes(value)) {
        delete data[value];
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
  }
}

module.exports = PushBullet;
