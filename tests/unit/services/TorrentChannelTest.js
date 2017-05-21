/**
 * Created by nathanyam on 10/04/2016.
 */

"use strict";

const sinon = require('sinon');
const should = require('chai').should();
const TorrentChannel = require('../../../src/services/Redis/TorrentChannel');

describe('UNIT: Torrent Channel', () => {
  let channel;
  let redisConn;
  let spy;

  beforeEach(() => {
    redisConn = {
      publish(channel, payload) {}
    };
    spy = sinon.spy(redisConn, 'publish');
    channel = new TorrentChannel(redisConn);
  });

  it('should publish a add_torrent event', () => {
    let status = channel.addTorrent('url', 'name');
    status.status.should.equal('success');
    status.message.should.equal('Success publish of action: add_torrent');
    spy.called.should.equal(true);
    spy.calledWith('torrent', JSON.stringify({ action: 'add_torrent', torrentUrl: 'url', name: 'name' })).should.equal(true);
  });

  it('should publish a move_torrent event', () => {
    let status = channel.moveTorrentFiles(123, '/media/shows/');
    status.status.should.equal('success');
    status.message.should.equal('Success publish of action: move_torrent_file');
    spy.called.should.equal(true);
    spy.calledWith(
      'torrent',
      JSON.stringify({
        action: 'move_torrent_file',
        torrentId: 123,
        destinationDirectory: '/media/shows/'
      })
    );
  });

  it('should publish a pause_torrent event', () => {
    let status = channel.pauseTorrent(123);
    status.status.should.equal('success');
    status.message.should.equal('Success publish of action: pause_torrent');
    spy.called.should.equal(true);
    spy.calledWith('torrent', JSON.stringify({ action: 'pause_torrent', torrentId: 123 })).should.equal(true);
  });

  it('should publish a resume_torrent event', () => {
    let status = channel.resumeTorrent(123);
    status.status.should.equal('success');
    status.message.should.equal('Success publish of action: resume_torrent');
    spy.called.should.equal(true);
    spy.calledWith('torrent', JSON.stringify({ action: 'resume_torrent', torrentId: 123 })).should.equal(true);
  });
});
