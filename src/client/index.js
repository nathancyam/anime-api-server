"use strict";

const ACTION_ADD_TORRENT = 'add_torrent';

var fs = require('fs');
var Redis = require('ioredis');

var config = JSON.parse(fs.readFileSync(__dirname + '/client.json').toString());
var redisSub = new Redis(6379, config.redis.host);
var Transmission = require('./transmission');
var torrentServer = new Transmission(config.torrent_server);

redisSub.subscribe('torrent', (err, count) => {
  console.log(`Currently subscribed to ${count} channels on ${config.redis.host}:6379. Listening on 'torrent' channel.`);
});

redisSub.on('message', (channel, message) => {
  if (channel !== 'torrent') {
    return;
  }

  const payload = JSON.parse(message);
  switch (payload.action) {
    case ACTION_ADD_TORRENT:
      torrentServer.add(payload.torrentUrl)
        .then(res => console.log(`Torrent added successfully: ${payload.torrentUrl}`))
        .catch(err => console.error(`Failed to add torrent: ${payload.torrentUrl}\n Error: ${err}`));
      break;
    default:
      break;
  }
});
