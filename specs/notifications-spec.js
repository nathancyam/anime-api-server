/**
 * Created by nathan on 7/31/14.
 */

var sinon = require('sinon'),
    expect = require('chai').expect,
    NotificationMgr = require('../src/backend/modules/notifications_manager');

describe('NotificationManager', function () {
    describe('#emit()', function () {
        it('should invoke the callback', function () {
            var spy = sinon.spy();

            NotificationMgr.on('test_event', spy);
            NotificationMgr.emit('test_event');

            expect(spy.called).to.eql(true);
        });

        it('should pass arguments to the callbacks', function () {
            var spy = sinon.spy(),
                testObj = { test: 'object' };

            NotificationMgr.on('test_event', spy);
            NotificationMgr.emit('test_event', testObj);
            sinon.assert.calledOnce(spy);
            sinon.assert.calledWith(spy, testObj);
        });
    });

    describe('#add()', function () {
        beforeEach(function (done) {
            sinon.spy(NotificationMgr, 'add');
            done();
        });

        afterEach(function (done) {
            NotificationMgr.add.restore();
            done();
        });

        it('should add a notification on the add_notification event', function () {
            NotificationMgr.emit('add_notification', { type: 'example', message: 'this is a test.' });
            expect(NotificationMgr.add.calledOnce).to.eql(true);
        });

        it('should throw an exception when the content is not specified', function () {
            expect(NotificationMgr.add).to.throw('Data undefined');
        });

        it('should throw an exception when the content is formatted incorrectly', function () {
            expect(function () {
                    NotificationMgr.add({});
                }
            ).to.throw('Invalid data format');
        });
    });
});