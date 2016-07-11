/**
 * Created by nathanyam on 18/03/2016.
 */

'use strict';

const Redis = require('ioredis');

class RedisConnection {

  /**
   * @param {Object} connectionOptions
   */
  constructor(connectionOptions) {
    this.connectionOptions = connectionOptions;
    this.connection = new Redis(connectionOptions);
  }

  /**
   * @returns {Redis|*}
   */
  getConnection() {
    return this.connection;
  }
}

class RedisSubscriber {

  /**
   * @param {Object} connectionOptions
   * @param {String[]} channels
   */
  constructor(connectionOptions, channels = ['meta']) {
    this.connectionOptions = connectionOptions;
    this.connection = new Redis(connectionOptions);
    this.channels = channels;
    this.publishConn = null;
    this.connection.subscribe(this.channels);
  }

  /**
   * @returns {Redis}
   */
  getConnection() {
    return this.connection;
  }

  /**
   * @returns {Redis}
   */
  createConnection() {
    return new Redis(this.connectionOptions);
  }

  publish(channel, data) {
    if (!this.publishConn) {
      this.publishConn = new Redis(this.connectionOptions);
    }

    this.publishConn.publish(channel, data);
  }
}

exports.RedisSubscriber = RedisSubscriber;
exports.RedisConnection = RedisConnection;
