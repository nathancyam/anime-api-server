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
const ImageHandler = require('../../../../src/services/AnimeNewsNetwork/image');
const GoogleHelper = require('../../../../src/services/AnimeNewsNetwork/google');
const EventEmitter = require('events').EventEmitter;
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

  describe('Image Parser', () => {
    let fsStub;
    let requestStub;
    let fsStream;

    beforeEach(() => {
      fsStub = sinon.stub(fs, 'readdir');
      fsStream = sinon.stub(fs, 'createWriteStream');
      requestStub = sinon.stub(request, 'get');
    });

    afterEach(() => {
      fsStub.restore();
      requestStub.restore();
      fsStream.restore();
    });

    it('should check if the image is in the directory and update the response', () => {
      const imageHandler = new ImageHandler('/tmp');

      fsStub.yields(null, [ 'ann_title_full.jpg' ]);

      return imageHandler.handle({
        main_title: ['Title'],
        images: [
          'small_image.jpg',
          'full_image.jpg',
          'medium_image.jpg'
        ]
      })
      .then(result => {
        result.images.should.contain('/media/images/ann_title_full.jpg');
      });
    });

    it('should download the image if it does not exist on our file system and update the response', () => {
      const mockStream = new stream.Writable();
      const imageHandler = new ImageHandler('/tmp');

      fsStub.yields(null, []);
      fsStream.returns(mockStream);

      requestStub.returns(
        {
          pipe() {
            setTimeout(() => {
              mockStream.emit('close')
            }, 10);
          }
        });

      return imageHandler.handle({
        main_title: ['Title'],
        images: [
          'small_image.jpg',
          'full_image.jpg',
          'medium_image.jpg'
        ]
      })
        .then(result => {
          requestStub.calledOnce.should.equal(true);
          result.images.should.contain('/media/images/ann_title_full.jpg');
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
          stub.calledWith('http://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=100')
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
          stub.calledWith('http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&type=anime&name=Amagi%20Brilliant%20Park')
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

      const nameProp = sinon.stub(nameSearcher, 'search');
      nameProp.returns(Promise.resolve({}));
      const idProp = sinon.stub(idSearcher, 'search');
      idProp.returns(Promise.resolve({}));

      const searcher = new AnimeNewsNetwork.Searcher(nameSearcher, idSearcher);
      searcher.search({ name: 'test' })
        .then(() => {
          nameProp.called.should.equal(true);
          idProp.called.should.equal(false);
          const newSearcher = new AnimeNewsNetwork.Searcher(nameSearcher, idSearcher);
          return newSearcher.search({ annId: 1234 });
        })
        .then(() => {
          idProp.called.should.equal(true);
        });
    });
  });

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
      const searcher = new GoogleHelper({
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
  });
});
