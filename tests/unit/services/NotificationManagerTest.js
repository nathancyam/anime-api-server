/**
 * Created by nathanyam on 21/07/2016.
 */

"use strict";

const NotificationManager = require('../../../src/services/NotificationManager');
const sinon = require('sinon');
const should = require('chai').should();

describe('NotificationManager', () => {
  it('should call the attached listener', () => {
    const callback = {
      emit() {}
    };

    const stub = sinon.stub(callback, 'emit');
    const manager = new NotificationManager();
    manager.attachListener(callback);
    manager.emit('some action', 'some data');

    stub.calledOnce.should.equal(true);
    stub.calledWith('some action', 'some data').should.equal(true);
  });
});
