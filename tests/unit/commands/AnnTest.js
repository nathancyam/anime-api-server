/**
 * Created by nathanyam on 22/08/2016.
 */

"use strict";

const AnnCommand = require('../../../src/commands/ann');
const sinon = require('sinon');
const should = require('chai').should();

describe('Ann Command', () => {
  let annSearcher = { search() {} };

  it('can create the command', () => {
    const container = { get() {} };
    const stub = sinon.stub(container, 'get');
    const anime = {};
    const searcher = {};

    AnnCommand.create(container, anime, searcher);

    stub.getCall(0).args[0].should.equal('ann_searcher');
  });

  it('can save the image', () => {
    const animeEntity = { save() {} };
    const stub = sinon.stub(annSearcher, 'search');
    const animeStub = sinon.stub(animeEntity, 'save');
    stub.returns(Promise.resolve({ images: [ { image_url: 'someurl' }]}));
    animeStub.returns(Promise.resolve(true));

    const cmd = new AnnCommand(annSearcher, animeEntity, { name: 'Nisekoi' });

    return cmd.execute()
      .then(() => {
        stub.calledWith({ name: 'Nisekoi' }).should.equal(true);
        animeStub.calledOnce.should.equal(true);
      });
  })
});
