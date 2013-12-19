'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on RDS', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var RDS = require('../lib/load.js').RDS;
	var STS = require('../lib/load.js').STS;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeDBInstancesResult.DBInstances);

		done();
	};

	describe('REMOTE RDS test with empty query argument', function() {
		it('should make a succesful RDS request', function(done) {
			var rds = new RDS(accessKeyId, secretAccessKey);
			rds.request('DescribeDBInstances', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE RDS test with query object', function() {
		it('should make a succesful RDS request', function(done) {
			var rds = new RDS(accessKeyId, secretAccessKey);
			rds.request('DescribeDBInstances', {
				MaxRecords: 20
			}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE RDS test with STS credentials', function() {
		it('should make a succesful RDS request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);

				var credentials = res.GetSessionTokenResult.Credentials;
				var rds = new RDS(credentials.AccessKeyId, credentials.SecretAccessKey);
				rds.setSessionToken(credentials.SessionToken);

				rds.request('DescribeDBInstances', function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

});
