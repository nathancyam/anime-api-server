/**
 * Created by nathanyam on 6/07/2016.
 */

"use strict";

const fs = require('fs');

const xmlResponse = fs.readFileSync(__dirname + '/fixtures/ann_response.xml');
const jsonResponse = JSON.parse(fs.readFileSync(__dirname + '/fixtures/ann_response.json'));
const generalXmlResponse = fs.readFileSync(__dirname + '/fixtures/general_response.xml');
const notFoundXmlResponse = fs.readFileSync(__dirname + '/fixtures/not_found.xml');
const googleJsonResponse = JSON.parse(fs.readFileSync(__dirname + '/fixtures/google_response.json'));
const should = require('chai').should();
const ResponseParser = require('../../../../src/services/AnimeNewsNetwork/parser');
const AnimeNewsNetwork = require('../../../../src/services/AnimeNewsNetwork');
const request = require('request');
const stream = require('stream');
const sinon = require('sinon');
const https = require('https');

describe('UNIT: Anime News Network Test', () => {
  describe('ResponseParser', () => {
    it('should parse the XML response', () => {
      const parser = ResponseParser.createWithParsers();
      return parser.parse(xmlResponse)
        .then(result => {
          result.should.deep.equal(jsonResponse);
        });
    });
  });

  describe('AnimeNewsNetworkSearcher', () => {
    let stub;

    beforeEach(() => {
      stub = sinon.stub(request, 'get');
    });

    afterEach(() => {
      stub.restore();
    });

    it('should find an anime based on an ANN Id', () => {
      stub.yields(null, {}, xmlResponse);
      const searcher = new AnimeNewsNetwork.IdSearcher(ResponseParser.createWithParsers());
      return searcher.search(100)
        .then(result => {
          stub.calledWith('http://cdn.animenewsnetwork.cc/encyclopedia/api.xml?anime=100')
            .should.equal(true);
          result.should.deep.equal(jsonResponse);
        });
    });

    it('should cache a result for the Id searcher', () => {
      stub.yields(null, {}, xmlResponse);
      const searcher = new AnimeNewsNetwork.IdSearcher(ResponseParser.createWithParsers());
      return searcher.search(100)
        .then(result => {
          stub.calledOnce.should.equal(true);
          result.should.deep.equal(jsonResponse);
          return searcher.search(100);
        })
        .then(result => {
          stub.calledTwice.should.equal(false);
          result.should.deep.equal(jsonResponse);
        });
    });

    it('should find the general anime based off a name', () => {
      const idSearcher = {
        search() {}
      };

      const idStub = sinon.stub(idSearcher, 'search');
      idStub.returns(Promise.resolve(jsonResponse));
      stub.yields(null, {}, generalXmlResponse);

      const searcher = new AnimeNewsNetwork.NameSearcher(
        idSearcher,
        {},
        ResponseParser.create()
      );

      return searcher.search('Amagi Brilliant Park')
        .then(result => {
          stub.calledWith('http://www.animenewsnetwork.cc/encyclopedia/reports.xml?id=155&type=anime&name=Amagi%20Brilliant%20Park')
            .should.equal(true);

          idStub.calledWith(16133).should.equal(true);
          result.should.deep.equal(jsonResponse);
          idStub.restore();
        })
    });

    it('should use Google if it can\'t find an anime', () => {
      const googleHelper = {
        searchAnime() {}
      };

      const idSearcher = {
        search() {}
      };

      const googleHelperStub = sinon.stub(googleHelper, 'searchAnime');
      const idStub = sinon.stub(idSearcher, 'search');

      stub.yields(null, {}, notFoundXmlResponse);
      idStub.returns(Promise.resolve(jsonResponse));
      googleHelperStub.returns(Promise.resolve(googleJsonResponse));

      const searcher = new AnimeNewsNetwork.NameSearcher(idSearcher, googleHelper, ResponseParser.create());

      return searcher.search('Whatever')
        .then(result => {
          googleHelperStub.calledWith('Nisekoi').should.equal(true);
          idStub.calledWith(17157).should.equal(true);
          result.should.deep.equal(jsonResponse);
          idStub.restore();
          googleHelperStub.restore();
        });
    });

    it('should use the right searcher for the search object', () => {
      const nameSearcher = {
        search() {}
      };

      const idSearcher = {
        search() {}
      };

      const spy = sinon.spy();
      const imageHandler = {
        handle: spy
      };

      const nameProp = sinon.stub(nameSearcher, 'search');
      nameProp.returns(Promise.resolve({}));
      const idProp = sinon.stub(idSearcher, 'search');
      idProp.returns(Promise.resolve({}));

      const searcher = new AnimeNewsNetwork.Searcher(nameSearcher, idSearcher, imageHandler);
      return searcher.search({ name: 'test' })
        .then(() => {
          nameProp.called.should.equal(true);
          idProp.called.should.equal(false);
          spy.calledOnce.should.equal(true);
          const newSearcher = new AnimeNewsNetwork.Searcher(nameSearcher, idSearcher, imageHandler);
          return newSearcher.search({ annId: 1234 });
        })
        .then(() => {
          spy.calledTwice.should.equal(true);
          idProp.called.should.equal(true);
        });
    });
  });

});
