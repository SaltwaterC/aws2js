'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on EMR', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var EMR = require('../lib/load.js').EMR;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeJobFlowsResult);

		done();
	};

	describe('REMOTE EMR test without query argument', function() {
		it('should make a succesful EMR request', function(done) {
			var emr = new EMR(accessKeyId, secretAccessKey);
			emr.request('DescribeJobFlows', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE EMR test with empty query argument', function() {
		it('should make a succesful EMR request', function(done) {
			var emr = new EMR(accessKeyId, secretAccessKey);
			emr.request('DescribeJobFlows', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
