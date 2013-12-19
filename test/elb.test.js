'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on ELB', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var ELB = require('../lib/load.js').ELB;
	var STS = require('../lib/load.js').STS;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeLoadBalancersResult);

		done();
	};

	describe('REMOTE ELB test with empty query argument', function() {
		it('should make a succesful ELB request', function(done) {
			var elb = new ELB(accessKeyId, secretAccessKey);
			elb.request('DescribeLoadBalancers', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE ELB test with STS credentials', function() {
		it('should make a succesful ELB request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);

				var credentials = res.GetSessionTokenResult.Credentials;
				var elb = new ELB(credentials.AccessKeyId, credentials.SecretAccessKey);
				elb.setSessionToken(credentials.SessionToken);

				elb.request('DescribeLoadBalancers', function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

});
