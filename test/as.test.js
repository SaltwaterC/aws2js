'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on AS', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var AS = require('../lib/load.js').AS;
	var STS = require('../lib/load.js').STS;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeAutoScalingGroupsResult.AutoScalingGroups);

		done();
	};

	describe('REMOTE AS test without query argument', function() {
		it('should make a succesful AS request', function(done) {
			var as = new AS(accessKeyId, secretAccessKey);
			as.request('DescribeAutoScalingGroups', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE AS test with STS credentials', function() {
		it('should make a succesful AS request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);

				var credentials = res.GetSessionTokenResult.Credentials;
				var as = new AS(credentials.AccessKeyId, credentials.SecretAccessKey);
				as.setSessionToken(credentials.SessionToken);

				as.request('DescribeAutoScalingGroups', function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

});
