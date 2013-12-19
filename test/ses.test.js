'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on SES', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var SES = require('../lib/load.js').SES;
	var STS = require('../lib/load.js').STS;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.ListVerifiedEmailAddressesResult.VerifiedEmailAddresses);

		done();
	};

	describe('REMOTE SES test with empty query argument', function() {
		it('should make a succesful SES request', function(done) {
			var ses = new SES(accessKeyId, secretAccessKey);
			ses.request('ListVerifiedEmailAddresses', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE SES test with STS credentials', function() {
		it('should make a succesful SES request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);

				var credentials = res.GetSessionTokenResult.Credentials;
				var ses = new SES(credentials.AccessKeyId, credentials.SecretAccessKey);
				ses.setSessionToken(credentials.SessionToken);

				ses.request('ListVerifiedEmailAddresses', function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

});
