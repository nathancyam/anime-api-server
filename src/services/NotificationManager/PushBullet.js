/**
 * Created by nathanyam on 17/03/2016.
 */

"use strict";

const request = require('request');
const debounce = require('lodash').debounce;
const PUSHBULLET_URI = 'https://api.pushbullet.com/v2/pushes';

class PushBullet {

  /**
   * @param config
   */
  constructor(config) {
    const apiKey = config.notifications.pushbullet_api_key;
    if (!apiKey) {
      throw new Error("PushBullet API key not specified.");
    }

    this._apiKey = apiKey;
    this._queue = [];
    this._debounceCall = debounce(this._call, 500);
  }

  /**
   * @param {Object} data
   */
  emit(data) {
    this._queue.push(data);
    return Promise.resolve(this._debounceCall(data));
  }

  /**
   * @param {Object} data
   * @param {Boolean} isQueueFlushed
   * @return {Promise}
   * @private
   */
  _call(data, isQueueFlushed = false) {
    if (!isQueueFlushed && this._queue.length > 1) {
      return this._flushQueue();
    }

    const pushBulletOptions = {
      url: PUSHBULLET_URI,
      json: true,
      headers: {
        'Access-Token': `${this._apiKey}`
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
    const pushBulletDefault = {
      type: 'note',
      title: 'title',
      body: data.message ? data.message : 'body'
    };

    // Get a list of the acceptable keys for PB data
    const acceptableKeys = Object.keys(pushBulletDefault);
    data = Object.assign({}, pushBulletDefault, data);

    // Remove any keys that shouldn't be a part of PB data
    Object.keys(data).forEach(value => {
      if (!acceptableKeys.includes(value)) {
        delete data[value];
      }
    });

    const isFormatted = acceptableKeys.every(function (elem) {
      return data[elem] && data[elem] !== 'undefined';
    });

    if (isFormatted) {
      return data;
    } else {
      throw new Error("Can not parse the data to a PushBullet format");
    }
  }

  /**
   * @return {Promise}
   * @private
   */
  _flushQueue() {
    let messages = this._queue.map(queueObj => this.toPushBullet(queueObj));
    let body = messages.map(msg => msg.body).join("\n");
    let title = 'Multiple Notifications';
    let type = 'note';

    this._queue = [];
    return this._call({ body, title, type }, true);
  }
}

module.exports = PushBullet;
