'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on CFN', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var CFN = require('../lib/load.js').CFN;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeStacksResult);

		done();
	};

	describe('REMOTE CFN test without query argument', function() {
		it('should make a succesful CFN request', function(done) {
			var cfn = new CFN(accessKeyId, secretAccessKey);
			cfn.request('DescribeStacks', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE CFN test with empty query argument', function() {
		it('should make a succesful CFN request', function(done) {
			var cfn = new CFN(accessKeyId, secretAccessKey);
			cfn.request('DescribeStacks', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
