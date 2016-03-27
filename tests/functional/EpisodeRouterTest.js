/**
 * Created by nathanyam on 27/03/2016.
 */

"use strict";

const request = require('supertest');
const app = require('../../src/server');
const should = require('chai').should();
const expect = require('chai').expect;

describe('API: Episode Router', () => {
  it('should get a list of episodes', (done) => {
    request(app)
      .get('/episodes')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        res.body.should.be.a('array');
        const anime = res.body[0];
        anime.should.be.a('object');
        anime.should.have.property('_id');
        done();
      })
  });
});
