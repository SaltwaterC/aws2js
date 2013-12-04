'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on EC2', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var EC2 = require('../lib/load.js').EC2;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.requestId);
		assert.ok(res.reservationSet);

		done();
	};

	describe('REMOTE EC2 test without query argument', function() {
		it('should make a succesful EC2 request', function(done) {
			var ec2 = new EC2(accessKeyId, secretAccessKey);
			ec2.request('DescribeInstances', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE EC2 test with empty query argument', function() {
		it('should make a succesful EC2 request', function(done) {
			var ec2 = new EC2(accessKeyId, secretAccessKey);
			ec2.request('DescribeInstances', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE EC2 test with query object', function() {
		it('should make a succesful EC2 request', function(done) {
			var ec2 = new EC2(accessKeyId, secretAccessKey);
			ec2.request('DescribeInstances', {
				'Filter.1.Value.1': 'i386',
				'Filter.1.Name': 'architecture',
			}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
