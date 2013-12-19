'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on IAM', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var IAM = require('../lib/load.js').IAM;


	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.ListUsersResult.Users);

		done();
	};

	describe('REMOTE IAM test without query argument', function() {
		it('should make a succesful IAM request', function(done) {
			var iam = new IAM(accessKeyId, secretAccessKey);
			iam.request('ListUsers', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE IAM test with empty query argument', function() {
		it('should make a succesful IAM request', function(done) {
			var iam = new IAM(accessKeyId, secretAccessKey);
			iam.request('ListUsers', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
