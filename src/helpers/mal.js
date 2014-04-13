/**
 * My Anime List API module
 */

"use strict";
var Cache = require('../models/cache');

var mal_user = require('../config').mal_username,
    mal_pw = require('../config').mal_password;

var options = {
    host: 'myanimelist.net',
    path: '/api/anime/search.xml?',
    auth: mal_user + ':' + mal_pw,
    query: {},
    search: {
        name: 'q'
    },
    cache: {
        tag: 'mal'
    }
};

var MyAnimeList = require('./anime_api')(options);

module.exports = MyAnimeList;
