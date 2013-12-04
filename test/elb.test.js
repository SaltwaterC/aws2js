'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

// read the credentials from the environment
var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// define the service client
var ELB = require('../lib/load.js').ELB;
var elb = new ELB(accessKeyId, secretAccessKey);

describe('Tests executed on ELB', function() {
	var handleResponse = function(err, res, done) {
		assert.ifError(err);
		
		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeLoadBalancersResult);
		
		done();
	};

	describe('REMOTE ELB test without query argument', function() {
		it('should make a succesful ELB request', function(done) {
			elb.request('DescribeLoadBalancers', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE ELB test with empty query argument', function() {
		it('should make a succesful ELB request', function(done) {
			elb.request('DescribeLoadBalancers', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
