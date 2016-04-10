/**
 * Created by nathanyam on 10/04/2016.
 */

"use strict";

const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
chai.use(chaiAsPromised);

const TransmissionServer = require('../../../src/services/TransmissionServer');

describe('UNIT: Transmission Server', () => {
  let transmissionServer;
  let redisConn;
  let spy;

  beforeEach(() => {
    redisConn = {
      addTorrent(url) {},
      moveTorrentFiles(torrentId, destination) {},
      resumeTorrent(torrentId) {},
      pauseTorrent(torrentId) {}
    };
  });

  it('should call redis to add a torrent', () => {
    spy = sinon.spy(redisConn, 'addTorrent');
    transmissionServer = new TransmissionServer(redisConn);

    return transmissionServer.add('url')
      .then(() => {
        spy.called.should.equal(true);
        spy.calledWith('url').should.equal.true;
      });
  });

  it('should be able to add multiple torrents', () => {
    spy = sinon.spy(redisConn, 'addTorrent');
    transmissionServer = new TransmissionServer(redisConn);

    return transmissionServer.add(['url1', 'url2'])
      .then(result => {
        spy.calledTwice.should.equal(true);
        result.length.should.equal(2);
      })
  });

  it('should be able to notify moving torrent files', () => {
    spy = sinon.spy(redisConn, 'moveTorrentFiles');
    transmissionServer = new TransmissionServer(redisConn);

    return transmissionServer.moveTorrentFiles(123, '/media/shows/')
      .then(() => {
        spy.calledWith(123, '/media/shows/').should.equal(true);
      });
  });

  it('should be able to notify pausing a torrent', () => {
    spy = sinon.spy(redisConn, 'pauseTorrent');
    transmissionServer = new TransmissionServer(redisConn);

    return transmissionServer.pauseTorrent(123)
      .then(() => {
        spy.calledWith(123).should.equal(true);
      })
  });

  it('should be able to notify resuming a torrent', () => {
    spy = sinon.spy(redisConn, 'resumeTorrent');
    transmissionServer = new TransmissionServer(redisConn);

    return transmissionServer.resumeTorrent(123)
      .then(() => {
        spy.calledWith(123).should.equal(true);
      })
  });
});