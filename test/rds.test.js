'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

// read the credentials from the environment
var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// define the service client
var RDS = require('../lib/load.js').RDS;
var rds = new RDS(accessKeyId, secretAccessKey);

describe('Tests executed on RDS', function() {
	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeDBInstancesResult.DBInstances);

		done();
	};

	describe('REMOTE RDS test without query argument', function() {
		it('should make a succesful RDS request', function(done) {
			rds.request('DescribeDBInstances', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE RDS test with empty query argument', function() {
		it('should make a succesful rds request', function(done) {
			rds.request('DescribeDBInstances', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE RDS test with query object', function() {
		it('should make a succesful rds request', function(done) {
			rds.request('DescribeDBInstances', {
				MaxRecords: 20
			}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
