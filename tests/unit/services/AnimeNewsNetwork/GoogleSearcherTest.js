/**
 * Created by nathanyam on 16/07/2016.
 */

"use strict";

const fs = require('fs');

const should = require('chai').should();
const AnimeNewsNetwork = require('../../../../src/services/AnimeNewsNetwork');
const GoogleHelper = require('../../../../src/services/AnimeNewsNetwork/google');
const EventEmitter = require('events').EventEmitter;
const request = require('request');
const stream = require('stream');
const sinon = require('sinon');
const https = require('https');

describe('Google searcher', () => {
  let requestStub;

  beforeEach(() => {
    requestStub = sinon.stub(https, 'request');
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should use Google search pagination to find a result', () => {
    const stubReturn =  new EventEmitter();
    const searcher = new GoogleHelper.GoogleSearch({
      custSearchAPI: 'testapi',
      custSearchCX: 'example'
    });

    requestStub.onCall(0).yields(stubReturn);
    requestStub.onCall(0).returns({ end() {

      stubReturn.emit('data', JSON.stringify({
        items: [ { link: "test1" }, { link: "test2" }, { link: "test3" } ]
      }));

      stubReturn.emit('end');

    } });

    requestStub.onCall(1).yields(stubReturn);
    requestStub.onCall(1).returns({ end() {

      stubReturn.emit('data', JSON.stringify({
        items: [ { link: "anime.php?id=123" }, { link: "test2" }, { link: "test3" } ]
      }));

      stubReturn.emit('end');

    } });

    return searcher.searchAnime('Test')
      .then(response => {
        requestStub.calledTwice.should.equal(true);
        response.should.deep.equal({
          items: [ { link: "anime.php?id=123" }, { link: "test2" }, { link: "test3" } ]
        })
      });
  });

  it('should throw an exception if it can not make a request', () => {
    const stubReturn =  new EventEmitter();
    const searcher = new GoogleHelper.GoogleSearch({
      custSearchAPI: 'testapi',
      custSearchCX: 'example'
    });

    requestStub.onCall(0).yields(stubReturn);
    requestStub.onCall(0).returns({ end() {
      stubReturn.emit('error', new Error('test error'));
    }});

    return searcher.searchAnime('Test')
      .catch(err => {
        err.message.should.equal('test error');
      });
  });

  it('should limit the number of Google custom searches', () => {
    const stubReturn =  new EventEmitter();
    const searcher = new GoogleHelper.GoogleSearch({
      custSearchAPI: 'testapi',
      custSearchCX: 'example'
    });

    requestStub.onCall(0).yields(stubReturn);
    requestStub.onCall(0).returns({ end() {
      stubReturn.emit('data', JSON.stringify({
        items: [ { link: "test1" } ]
      }));

      stubReturn.emit('end');
    } });

    requestStub.onCall(1).yields(stubReturn);
    requestStub.onCall(1).returns({ end() {
      stubReturn.emit('data', JSON.stringify({
        items: [ { link: "test2" } ]
      }));

      stubReturn.emit('end');
    } });

    requestStub.onCall(2).yields(stubReturn);
    requestStub.onCall(2).returns({ end() {
      stubReturn.emit('data', JSON.stringify({
        items: [ { link: "test2" } ]
      }));

      stubReturn.emit('end');
    } });

    requestStub.onCall(3).yields(stubReturn);
    requestStub.onCall(3).returns({ end() {
      stubReturn.emit('data', JSON.stringify({
        items: [ { link: "test2" } ]
      }));

      stubReturn.emit('end');
    } });

    return searcher.searchAnime('Test')
      .catch(err => {
        err.message.should.equal('Exceeded Google Counter limit of 30');
      });
  });
});

describe('Redis Google Searcher', () => {

  it('should return a cache key in the correct format', () => {
    const googleSearcher = new GoogleHelper.RedisGoogleSearch({}, {});
    googleSearcher.getCacheKey('test anime')
      .should.equal('google_ann_id_test_anime')
  });

  it('should use the cache to pull out existing results', () => {
    const response = {
      'title': 'Test Anime'
    };

    const googleSearcher = new GoogleHelper.RedisGoogleSearch(
      {
        getConnection() {
          return {
            get() {
              return Promise.resolve(JSON.stringify(response));
            }
          };
        }
      },
      {}
    );

    return googleSearcher.searchAnime('test anime')
      .then(resp => {
        resp.should.deep.equal(response);
      });
  });

  it('should push results to the cache and return the result', () => {
    const redisSet = sinon.stub();
    const response = {
      'title': 'Test Anime'
    };
    redisSet.returns(Promise.resolve());

    const googleSearcher = new GoogleHelper.RedisGoogleSearch(
      {
        getConnection() {
          return {
            get() {
              return Promise.resolve();
            },
            set: redisSet
          };
        }
      },
      {
        searchAnime() {
          return Promise.resolve(response);
        }
      }
    );

    return googleSearcher.searchAnime('Test Anime')
      .then(resp => {
        redisSet.calledWith('google_ann_id_test_anime', JSON.stringify(response))
          .should.equal(true);
        resp.should.deep.equal(response);
      });
  });
});
