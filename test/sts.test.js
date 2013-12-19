'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on STS', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var STS = require('../lib/load.js').STS;


	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.GetSessionTokenResult.Credentials.SessionToken);

		done();
	};

	describe('REMOTE STS test without query argument', function() {
		it('should make a succesful STS request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE STS test with empty query argument', function() {
		it('should make a succesful STS request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
