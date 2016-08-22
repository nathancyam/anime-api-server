/**
 * Created by nathanyam on 21/07/2016.
 */

"use strict";

const sinon = require('sinon');
const PushBullet = require('../../../src/services/NotificationManager/PushBullet');
const should = require('chai').should();
const request = require('request');

describe('PushBullet', () => {
  let requestStub;

  beforeEach(done => {
    requestStub = sinon.stub(request, 'post');
    requestStub.yields(null, {}, {});
    done();
  });

  afterEach(done => {
    requestStub.restore();
    done();
  });

  it('should call Pushbullet with a custom body', () => {
    const pb = new PushBullet({ notifications: { pushbullet_api_key: 'asdf' } });

    return pb.callPushBullet({
      message: 'message',
      invalid: 'invalid',
      title: 'Some Title'
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
    const pb = new PushBullet({ notifications: { pushbullet_api_key: 'asdf' } });

    return pb.callPushBullet({}).then(() => {
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
});
