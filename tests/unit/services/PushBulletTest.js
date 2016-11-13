/**
 * Created by nathanyam on 21/07/2016.
 */

"use strict";

const sinon = require('sinon');
const PushBullet = require('../../../src/services/NotificationManager/PushBullet');
const NotificationManager = require('../../../src/services/NotificationManager');
const should = require('chai').should();
const request = require('request');

describe('PushBullet', () => {
  let requestStub;
  let pb;

  beforeEach(done => {
    requestStub = sinon.stub(request, 'post');
    requestStub.yields(null, {}, {});
    pb = new PushBullet({ notifications: { pushbullet_api_key: 'asdf' } });
    done();
  });

  afterEach(done => {
    requestStub.restore();
    done();
  });

  it('should call Pushbullet with a custom body', () => {
    return pb.emit(null, {
      message: 'message',
      invalid: 'invalid',
      title: 'Some Title'
    }).then(() => {
      return new Promise(resolve => {
        setTimeout(resolve, 700);
      });
    }).then(() => {
      const expected = {
        url: 'https://api.pushbullet.com/v2/pushes',
        json: true,
        headers: {
          'Access-Token': 'asdf'
        },
        body: {
          type: 'note',
          title: 'Some Title',
          body: 'message'
        }
      };

      const actual = requestStub.getCall(0).args[0];
      actual.should.deep.equal(expected);
    });
  });

  it('should call Pushbullet with a default body', () => {
    return pb.emit(null, {})
      .then(() => {
        return new Promise(resolve => {
          setTimeout(resolve, 700);
        })
      })
      .then(() => {
        const expected = {
          url: 'https://api.pushbullet.com/v2/pushes',
          json: true,
          headers: {
            'Access-Token': 'asdf'
          },
          body: {
            type: 'note',
            title: 'title',
            body: 'body'
          }
        };

        const actual = requestStub.getCall(0).args[0];
        actual.should.deep.equal(expected);
      });
  });

  it('should debounce multiple emitters to push to Pushbullet', () => {
    const expected = {
      url: 'https://api.pushbullet.com/v2/pushes',
      json: true,
      headers: {
        'Access-Token': 'asdf'
      },
      body: {
        type: 'note',
        title: 'Multiple Notifications',
        body: "Message 1\nMessage 2\nMessage 3"
      }
    };

    return pb.emit(null, { body: 'Message 1' })
      .then(() => pb.emit(null, { body: 'Message 2' }))
      .then(() => pb.emit(null, { body: 'Message 3' }))
      .then(() => {
        return new Promise(resolve => setTimeout(resolve, 750));
      })
      .then(() => {
        requestStub.calledOnce.should.equal(true);
        requestStub.calledTwice.should.equal(false);
        requestStub.calledThrice.should.equal(false);
        const actual = requestStub.getCall(0).args[0];

        actual.should.deep.equal(expected);
      });
  });

  it('should attach to the notification manager', () => {
    const notifyMgr = new NotificationManager();
    const body = {
      type: 'note',
      title: 'New Torrent Added',
      message: `Torrent Added`,
      body: `Torrent Added`
    };

    const expected = {
      url: 'https://api.pushbullet.com/v2/pushes',
      json: true,
      headers: {
        'Access-Token': 'asdf'
      },
      body: {
        type: 'note',
        title: 'Multiple Notifications',
        body: "Torrent Added\nTorrent Added\nTorrent Added"
      }
    };

    notifyMgr.attachListener(pb);
    notifyMgr.emit('notification:new', body);
    notifyMgr.emit('notification:new', body);
    notifyMgr.emit('notification:new', body);

    return new Promise(resolve => setTimeout(resolve, 800))
      .then(() => {
        requestStub.calledOnce.should.equal(true);
        requestStub.calledTwice.should.equal(false);
        requestStub.calledThrice.should.equal(false);
        expected.should.deep.equal(requestStub.getCall(0).args[0]);
      })
  });
});
