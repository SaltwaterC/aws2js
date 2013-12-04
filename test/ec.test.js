'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on EC', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var EC = require('../lib/load.js').EC;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.DescribeCacheClustersResult);

		done();
	};

	describe('REMOTE EC test without query argument', function() {
		it('should make a succesful EC request', function(done) {
			var ec = new EC(accessKeyId, secretAccessKey);
			ec.request('DescribeCacheClusters', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE EC test with empty query argument', function() {
		it('should make a succesful EC request', function(done) {
			var ec = new EC(accessKeyId, secretAccessKey);
			ec.request('DescribeCacheClusters', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
