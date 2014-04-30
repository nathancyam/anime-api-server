/**
 * My Anime List API module
 */

"use strict";
var Cache = require('../models/cache'),
    AnimeAPI = require('./anime_api');

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

var MyAnimeList = module.exports = new AnimeAPI(options);

module.exports = MyAnimeList;
