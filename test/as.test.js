'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on AS', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var AS = require('../lib/load.js').AS;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeScalingActivitiesResult);

		done();
	};

	describe('REMOTE AS test without query argument', function() {
		it('should make a succesful AS request', function(done) {
			var as = new AS(accessKeyId, secretAccessKey);
			as.request('DescribeScalingActivities', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE AS test with empty query argument', function() {
		it('should make a succesful AS request', function(done) {
			var as = new AS(accessKeyId, secretAccessKey);
			as.request('DescribeScalingActivities', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
