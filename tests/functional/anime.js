/**
 * Created by nathanyam on 27/03/2016.
 */

"use strict";

const request = require('supertest');
const app = require('../../src/server');
const should = require('chai').should();
const expect = require('chai').expect;
app.set('port', 3333);

describe('API: Anime Router', () => {
  it('should get a list of anime', (done) => {
    request(app)
      .get('/anime')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        res.body.should.be.a('array');
        const anime = res.body[0];
        anime.should.be.a('object');
        anime.should.have.property('_id');
        anime.should.have.property('title');
        anime.should.have.property('filepath');
        done();
      })
  });

  it('should inform you if you can\'t find an anime', (done) => {
    request(app)
      .get('/anime/notfound')
      .set('Accept', 'application/json')
      .expect(404)
      .end(() => {
        done();
      })
  });
});
