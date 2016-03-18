/**
 * Created by nathanyam on 18/03/2016.
 */

'use strict';

const Redis = require('ioredis');

class RedisConnector {
  constructor(connectionOptions) {
    this.connectionOptions = connectionOptions;
    this.connection = new Redis(connectionOptions);
    this.subscribeConn = null;
    this.publishConn = null;
  }

  getConnection() {
    return this.connection;
  }

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

module.exports = RedisConnector;