/**
 * Created by nathanyam on 21/07/2016.
 */

"use strict";

const NotificationManager = require('../../../src/services/NotificationManager');
const sinon = require('sinon');
const should = require('chai').should();

describe('NotificationManager', () => {
  it('should call the attached listener', () => {
    const spy = sinon.spy();
    const manager = new NotificationManager();
    manager.on('message', spy);
    manager.emit('message', 'some data');

    spy.calledOnce.should.equal(true);
    spy.calledWith('some data').should.equal(true);
  });
});
