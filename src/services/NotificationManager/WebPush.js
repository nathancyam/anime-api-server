const webpush = require('web-push');

class WebPush {
  constructor(config) {
    this.vapidKeys = config.vapid;
    this.gcmAPIKey = config.gcm_api_key;

    webpush.setGCMAPIKey(this.gcmAPIKey);
    webpush.setVapidDetails('mailto:nathan@nathanyam.com', this.vapidKeys.publicKey, this.vapidKeys.privateKey);
  }

  /**
   * @param {User} user
   * @param payload
   */
  async pushNotification(userModel, payload) {
    const user = await userModel.findOne({ 'settings.keys': { $exists: true } });
    const keys = user.settings.keys;

    const pushSubscription = {
      endpoint: keys.endpoint,
      keys: {
        p256dh: keys.key,
        auth: keys.authSecret,
      }
    };

    const options = {
      TTL: 3600,
    };

    return await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      options
    );
  }

}

module.exports = WebPush;
