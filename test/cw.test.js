'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on CW', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var CW = require('../lib/load.js').CW;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeAlarmsResult);

		done();
	};

	describe('REMOTE CW test without query argument', function() {
		it('should make a succesful CW request', function(done) {
			var cw = new CW(accessKeyId, secretAccessKey);
			cw.request('DescribeAlarms', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE CW test with empty query argument', function() {
		it('should make a succesful CW request', function(done) {
			var cw = new CW(accessKeyId, secretAccessKey);
			cw.request('DescribeAlarms', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
