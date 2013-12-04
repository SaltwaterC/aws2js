'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on SES', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var SES = require('../lib/load.js').SES;
	
	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.ListVerifiedEmailAddressesResult.VerifiedEmailAddresses);

		done();
	};

	describe('REMOTE SES test without query argument', function() {
		it('should make a succesful SES request', function(done) {
			var ses = new SES(accessKeyId, secretAccessKey);
			ses.request('ListVerifiedEmailAddresses', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE SES test with empty query argument', function() {
		it('should make a succesful SES request', function(done) {
			var ses = new SES(accessKeyId, secretAccessKey);
			ses.request('ListVerifiedEmailAddresses', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
