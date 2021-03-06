'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on DDB', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var STS = require('../lib/load.js').STS;
	var DDB = require('../lib/load.js').DDB;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.TableNames);

		done();
	};

	describe('REMOTE DDB test without json argument', function() {
		it('should make a succesful DDB request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);
				var credentials = res.GetSessionTokenResult.Credentials;
				var ddb = new DDB(
					credentials.AccessKeyId,
					credentials.SecretAccessKey,
					credentials.SessionToken
				);
				ddb.request('ListTables', function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

	describe('REMOTE DDB test with empty json argument', function() {
		it('should make a succesful DDB request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', {}, function(err, res) {
				assert.ifError(err);
				var credentials = res.GetSessionTokenResult.Credentials;
				var ddb = new DDB(
					credentials.AccessKeyId,
					credentials.SecretAccessKey,
					credentials.SessionToken
				);
				ddb.request('ListTables', {}, function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

});
