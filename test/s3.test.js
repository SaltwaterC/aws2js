'use strict';

/*global describe: true, it: true, before: true, after: true*/

var http = require('http-request');
var xmlParser = require('libxml-to-js');
var assert = require('chai').assert;

describe('Tests executed on S3', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var bucket = process.env.AWS2JS_S3_BUCKET;
	var S3 = require('../lib/load.js').S3;
	// var STS = require('../lib/load.js').STS; // not enabled, yet

	describe('REMOTE S3 test for signUrl', function() {
		it('should generate a signed URL, test it with http-request', function(done) {
			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.setBucket(bucket);

			http.get(s3.signUrl('https', 'GET', '/', s3.expires(3600)), function(err, res) {
				assert.ifError(err);

				xmlParser(res.buffer, function(err, res) {
					assert.ifError(err);

					assert.strictEqual(res.Name, bucket);
					assert.strictEqual(res.MaxKeys, '1000');

					done();
				});
			});
		});
	});

});
