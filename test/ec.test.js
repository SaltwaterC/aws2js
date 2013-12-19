'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on EC', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var EC = require('../lib/load.js').EC;
	var STS = require('../lib/load.js').STS;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeCacheClustersResult);

		done();
	};

	describe('REMOTE EC test with empty query argument', function() {
		it('should make a succesful EC request', function(done) {
			var ec = new EC(accessKeyId, secretAccessKey);
			ec.request('DescribeCacheClusters', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE EC test with STS credentials', function() {
		it('should make a succesful EC request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);

				var credentials = res.GetSessionTokenResult.Credentials;
				var ec = new EC(credentials.AccessKeyId, credentials.SecretAccessKey);
				ec.setSessionToken(credentials.SessionToken);

				ec.request('DescribeCacheClusters', function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

});
