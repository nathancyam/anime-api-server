/**
 * Created by nathanyam on 27/03/2016.
 */

"use strict";

const request = require('supertest');
const app = require('../../src/server');
const should = require('chai').should();
const expect = require('chai').expect;

describe('API: NyaaTorrents Router', () => {
  it('should get a list of torrents', function(done) {
    this.timeout(5000);
    request(app)
      .get('/nyaatorrents/search?name=Nisekoi')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        const anime = res.body[0];
        expect(err).to.be.null;
        anime.should.have.property('name');
        anime.should.have.property('href');
        anime.should.have.property('seeds');
        anime.should.have.property('leeches');
        anime.should.have.property('downloads');
        done();
      })
  });
});
