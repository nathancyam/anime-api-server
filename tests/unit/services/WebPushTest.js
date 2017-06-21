const webpush = require('web-push');
const sinon = require('sinon');
const should = require('chai').should();
const WebPush = require('../../../src/services/NotificationManager/WebPush');

const config = {
  "vapid": {
    "publicKey":"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
      "privateKey":"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  },
  "gcm_api_key": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
};

describe('WebPush', () => {
  let webpushStub;

  beforeEach(done => {
    webpushStub = sinon.stub(webpush, 'sendNotification');
    webpushStub.returns(Promise.resolve());
    done();
  });

  afterEach(done => {
    webpushStub.restore();
    done();
  });

  it('should push notifications using webpush', () => {
    const settings = { keys: { endpoint: 'test_endpoint', key: 'test_key', authSecret: 'test_secret' }};
    const wp = new WebPush(config);
    return wp.pushNotification({
      findOne: () => Promise.resolve({ settings }),
    }, { body: 'test_body' })
      .then(() => {
        webpushStub.getCall(0).args[0].should.deep.equal({
          endpoint: 'test_endpoint',
          keys: {
            p256dh: 'test_key',
            auth: 'test_secret',
          }
        });
        webpushStub.getCall(0).args[1].should.equal(JSON.stringify({ body: 'test_body' }));
        webpushStub.getCall(0).args[2].should.deep.equal({ TTL: 3600 });
      });

  });
});
