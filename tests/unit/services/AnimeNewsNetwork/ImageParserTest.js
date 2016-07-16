/**
 * Created by nathanyam on 16/07/2016.
 */

"use strict";

const fs = require('fs');
const should = require('chai').should();
const AnimeNewsNetwork = require('../../../../src/services/AnimeNewsNetwork');
const ImageHandler = require('../../../../src/services/AnimeNewsNetwork/image');
const request = require('request');
const stream = require('stream');
const sinon = require('sinon');
const https = require('https');

describe('ANN: Image Parser', () => {
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

  it('should throw an error', () => {
    const imageHandler = new ImageHandler('/tmp');

    fsStub.yields(new Error('Can not read'), null);
    return imageHandler.handle({
      main_title: ['Title'],
      images: [
        'small_image.jpg',
        'full_image.jpg',
        'medium_image.jpg'
      ]
    }).catch(err => {
      err.message.should.equal('Can not read');
    });
  });
});
