'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

// read the credentials from the environment
var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// define the service client
var RDS = require('../lib/rds.js');

describe('Tests executed on RDS', function() {

	describe('REMOTE RDS test without query argument', function() {
		it('should make a succesful rds request', function(done) {
			var rds = new RDS(accessKeyId, secretAccessKey);
			
			console.log(rds.getEndPoint());

			rds.request('DescribeDBInstances', function(err, res) {
				assert.ifError(err);

				assert.ok(res.requestId);
				assert.ok(res.DescribeDBInstancesResult.DBInstances);

				done();
			});
		});
	});

	describe('REMOTE RDS test with empty query argument', function() {
		it('should make a succesful rds request', function(done) {
			var rds = new RDS(accessKeyId, secretAccessKey);

			rds.request('DescribeDBInstances', {}, function(err, res) {
				assert.ifError(err);

				assert.ok(res.requestId);
				assert.ok(res.DescribeDBInstancesResult.DBInstances);

				done();
			});
		});
	});

	describe('REMOTE rds test with query object', function() {
		it('should make a succesful rds request', function(done) {
			var rds = new RDS(accessKeyId, secretAccessKey);

			rds.request('DescribeDBInstances', {
				MaxRecords: 20
			}, function(err, res) {
				assert.ifError(err);

				assert.ok(res.requestId);
				assert.ok(res.DescribeDBInstancesResult.DBInstances);

				done();
			});
		});
	});

});
