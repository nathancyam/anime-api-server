"use strict";

var EventEmitter = require('events').EventEmitter;

class NotificationManager extends EventEmitter {

  constructor() {
    super();
    this.listeners = [];
  }

  attachListener(listener) {
    this.listeners.push(listener);
  }

  emit(action, data) {
    this.listeners.forEach(listener => listener.emit(action, data));
  }
}

module.exports = NotificationManager;

