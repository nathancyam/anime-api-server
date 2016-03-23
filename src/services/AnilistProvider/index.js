/**
 * Created by nathanyam on 18/03/2016.
 */

'use strict';

const fetch = require('isomorphic-fetch');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const provider = 'http://localhost:1337';
const ANILIST_API_URI = 'https://anilist.co/api';

class AnilistStrategy extends OAuth2Strategy {
  authorizationParams(options) {
    return Object.assign({}, options, {
      grant_type: 'authorization_code'
    });
  }
}

class AnilistClient {
  constructor(accessToken, refreshToken) {
    this.apiUrl = 'https://anilist.co/api';
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  user(userId) {
    let url = '/user';
    if (userId) {
      url = `/user/${userId}`;
    }

    return this.makeRequest(url);
  }

  makeRequest(url, method, body) {
    url = `${this.apiUrl}${url}`;
    method = method || 'GET';

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: body
    };

    return fetch(url, options)
      .then(response => response.json());
  }
}

module.exports = (app, config) => {
  app.use(passport.initialize());
  app.use(passport.session());

  let User = app.getModel('user');

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  let anilistOAuthStrategy = new AnilistStrategy(
    {
      authorizationURL: `${ANILIST_API_URI}/auth/authorize`,
      tokenURL: `${ANILIST_API_URI}/auth/access_token`,
      clientID: config.anilist.key,
      clientSecret: config.anilist.secret,
      callbackURL: `${provider}/api/auth/anilist/callback`
    },
    (accessToken, refreshToken, profile, done) => {
      const apiClient = new AnilistClient(accessToken, refreshToken);
      app.set('anilist_api', apiClient);
      apiClient.user()
        .then(anilistUser => {
          User.findOne({ anilistId: anilistUser.id }, (err, user) => {
            if (!user) {
              User.create({
                anilistId: anilistUser.id,
                anilistAccessToken: accessToken,
                anilistRefreshToken: refreshToken,
              }, (err, user) => {
                done(null, user);
              })
            }

            done(null, user);
          });
        })
        .catch(err => done(err));
    }
  );

  passport.use('anilist', anilistOAuthStrategy);
};

