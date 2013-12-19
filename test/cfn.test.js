'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on CFN', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var CFN = require('../lib/load.js').CFN;
	var STS = require('../lib/load.js').STS;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeStacksResult);

		done();
	};

	describe('REMOTE CFN test with empty query argument', function() {
		it('should make a succesful CFN request', function(done) {
			var cfn = new CFN(accessKeyId, secretAccessKey);
			cfn.request('DescribeStacks', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE CFN test with STS credentials', function() {
		it('should make a succesful CFN request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);

				var credentials = res.GetSessionTokenResult.Credentials;
				var cfn = new CFN(credentials.AccessKeyId, credentials.SecretAccessKey);
				cfn.setSessionToken(credentials.SessionToken);

				cfn.request('DescribeStacks', function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

});
