'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on SNS', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var SNS = require('../lib/load.js').SNS;
	var STS = require('../lib/load.js').STS;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.ListSubscriptionsResult);

		done();
	};

	describe('REMOTE SNS test with empty query argument', function() {
		it('should make a succesful SNS request', function(done) {
			var sns = new SNS(accessKeyId, secretAccessKey);
			sns.request('ListSubscriptions', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE SNS test with STS credentials', function() {
		it('should make a succesful SNS request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);

				var credentials = res.GetSessionTokenResult.Credentials;
				var sns = new SNS(credentials.AccessKeyId, credentials.SecretAccessKey);
				sns.setSessionToken(credentials.SessionToken);

				sns.request('ListSubscriptions', function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

});
