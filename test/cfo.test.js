'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on CFo', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var CFo = require('../lib/load.js').CFo;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeStacksResult);

		done();
	};

	describe('REMOTE CFo test without query argument', function() {
		it('should make a succesful CFo request', function(done) {
			var cfo = new CFo(accessKeyId, secretAccessKey);
			cfo.request('DescribeStacks', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE CFo test with empty query argument', function() {
		it('should make a succesful CFo request', function(done) {
			var cfo = new CFo(accessKeyId, secretAccessKey);
			cfo.request('DescribeStacks', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
