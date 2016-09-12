'use strict';

var structuredDataProxy = require('../index.js');
var request = require('request');
var assert = require('chai').assert;
var sinon = require('sinon');
var express = require('express');
var supertest = require('supertest');

var html = '<h1>hello</h1>';

describe('getStructuredDataResults - happy path', function() {

  it('succesful request - with valid json', function(done) {
    sinon.stub(request, 'post').yields(null, {
        body: '{"key":"value"}'
    });

    structuredDataProxy.getStructuredDataResults(html, function(response) {
      assert.equal(response.status, 'success');
      assert.equal(response.statusCode, 200);
      assert.equal(response.data, {key:'value'}.toString());
      request.post.restore();

      done();
    });
  });

  it('succesful request - with simulated response', function(done) {
    sinon.stub(request, 'post').yields(null, {
        body: ')]}\'{"key":"value 2"}'
    });

    structuredDataProxy.getStructuredDataResults(html, function(response) {
      assert.equal(response.status, 'success');
      assert.equal(response.statusCode, 200);
      assert.equal(response.data, {key:'value 2'}.toString());
      request.post.restore();

      done();
    });
  });
});

describe('getStructuredDataResults - unhappy path', function() {

  it('failed request - with valid json', function(done) {
    sinon.stub(request, 'post').yields(true);

    structuredDataProxy.getStructuredDataResults(html, function(response) {
      assert.equal(response.status, 'failure');
      assert.equal(response.statusCode, 500);
      assert.equal(response.data, 'Something blew up');
      request.post.restore();

      done();
    });
  });

});

describe('test api route and response', function() {

  before(function() {
    sinon.stub(request, 'post').yields(null, {
        body: '{"key":"value"}'
    });
  });

  after(function() {
    request.post.restore();
  });

  it('Check for successful request', function(done) {
    var app = express();
    structuredDataProxy.init(app, function() {
      supertest(app)
      .post('/_structured_data_proxy_')
      .expect(200)
      .end(function(err){
        if (err) {
          throw err;
        }
        done();
      });
    });
  });

});
