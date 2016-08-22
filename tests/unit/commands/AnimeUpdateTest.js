/**
 * Created by nathanyam on 22/08/2016.
 */

"use strict";

const AnimeUpdateCommand = require('../../../src/commands/anime/update');
const sinon = require('sinon');
const should = require('chai').should();

describe('Anime Update Command', () => {
  let repo = { find() {} };
  let autoUpdater = { createCollection() {} };
  let torrent = { search() {} };
  let server = { postTorrentsToServer() {} };

  it('should create the command from the container', () => {
    const container = { get() {} };
    const stub = sinon.stub(container, 'get');
    AnimeUpdateCommand.create(container);

    stub.getCall(0).args[0].should.equal('anime');
    stub.getCall(1).args[0].should.equal('auto_updater');
    stub.getCall(2).args[0].should.equal('nyaatorrents');
    stub.getCall(3).args[0].should.equal('torrent_server');
  });

  it('should post torrents to the server', () => {

    const animeResult = [{ _id: '1234', title: 'Nisekoi' }];
    const stubRepo = sinon.stub(repo, 'find');
    const stubUpdater = sinon.stub(autoUpdater, 'createCollection');
    const updater = { postTorrentsToServer() {} };
    const updateStub = sinon.stub(updater, 'postTorrentsToServer');
    stubRepo.returns(Promise.resolve(animeResult));
    stubUpdater.returns([updater]);

    const cmd = new AnimeUpdateCommand(
      repo,
      autoUpdater,
      torrent,
      server,
      { name: 'Nisekoi' }
    );

    return cmd.execute()
      .then(() => {
        stubRepo.calledWith({ name: 'Nisekoi' }).should.equal(true);
        stubUpdater.calledWith(animeResult, torrent, server).should.equal(true);
        updateStub.calledOnce.should.equal(true);
      });
  });
});