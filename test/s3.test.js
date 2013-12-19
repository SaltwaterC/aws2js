'use strict';

/*global describe: true, it: true*/

var http = require('http-request');
var coreHttp = require('http');
var xmlParser = require('libxml-to-js');
var assert = require('chai').assert;

describe('Tests executed on S3', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var bucket = process.env.AWS2JS_S3_BUCKET;

	var aws = require('../lib/load.js');
	var S3 = aws.S3;
	var STS = aws.STS;

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

	describe('REMOTE S3 test for get with STS credentials', function() {
		it('should issue a signed request to the bucket list', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);

				var credentials = res.GetSessionTokenResult.Credentials;

				var s3 = new S3(credentials.AccessKeyId, credentials.SecretAccessKey);
				s3.setSessionToken(credentials.SessionToken);

				s3.get('/', 'xml', function(err, res) {
					assert.ifError(err);

					var i, buckets = res.Buckets.Bucket;
					assert.isArray(buckets);

					var found = false;
					for (i = 0; i < buckets.length; i++) {
						if (buckets[i].Name === bucket) {
							found = true;
						}
					}
					assert.ok(found);

					done();
				});
			});
		});
	});

	describe('REMOTE S3 test with get bucket prefix', function() {
		it('should issue various get requests with different way of expressing the bucket prefix', function(done) {
			var handleResponse = function(err, res) {
				assert.ifError(err);

				assert.deepEqual(res.Name, bucket);
				assert.equal(res.MaxKeys, 1);
			};

			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.setBucket(bucket);

			s3.get('/', {
				'max-keys': 1,
				prefix: '/'
			}, 'xml', function(err, res) {
				handleResponse(err, res);

				s3.get('/?max-keys=1&prefix=/', 'xml', function(err, res) {
					handleResponse(err, res);

					done();
				});
			});
		});
	});

	describe('REMOTE S3 test with get subresource', function() {
		it('should issue a succesful request to ?acl', function(done) {
			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.setBucket(bucket);

			s3.get('?acl', 'xml', function(err, res) {
				assert.ifError(err);

				assert.ok(res.Owner.ID);
				assert.ok(res.Owner.DisplayName);
				assert.ok(res.AccessControlList);

				done();
			});
		});
	});

	describe('REMOTE S3 test with get subresource and query arguments', function() {
		it('should issue succesful requests to various ways of expressing a subresource call and their query arguments', function(done) {
			var handleResponse = function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res.Bucket, bucket);
				assert.strictEqual(res.MaxUploads, '1');
			};

			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.setBucket(bucket);
			s3.get('?uploads', {
				'max-uploads': 1
			}, 'xml', function(err, res) {
				handleResponse(err, res);
				s3.get('?uploads&max-uploads=1', 'xml', function(err, res) {
					handleResponse(err, res);
					s3.get('/', {
						uploads: null,
						'max-uploads': 1
					}, 'xml', function(err, res) {
						handleResponse(err, res);
						done();
					});
				});
			});
		});
	});

	describe('REMOTE S3 test get with stream handler', function() {
		it('should return an IncomingMessage object', function(done) {
			var IncomingMessage = coreHttp.IncomingMessage;
			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.get('/', 'stream', function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res.statusCode, 200);
				assert.strictEqual(res.headers['content-type'], 'application/xml');
				assert.strictEqual(res.headers.server, 'AmazonS3');
				assert.instanceOf(res, IncomingMessage);

				done();
			});
		});
	});

	describe('REMOTE S3 test head', function() {
		it('should sent a succesful signed HEAD request', function(done) {
			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.setBucket(bucket);
			s3.head('/', function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res['content-type'], 'application/xml');
				assert.strictEqual(res.server, 'AmazonS3');

				done();
			});
		});
	});

	describe('REMOTE S3 test delete non existent file', function() {
		it('should make a succesful request, even though the target does not exist', function(done) {
			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.setBucket(bucket);
			s3.delete('/i-do-not-exist', function(err, res) {
				assert.ifError(err);

				assert.ok(res.date);
				assert.strictEqual(res.server, 'AmazonS3');

				done();
			});
		});
	});

	describe('REMOTE S3 test put buffer', function() {
		it('should upload a file to S3', function(done) {
			var buf = 'S3 PUT test';
			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.setBucket(bucket);
			s3.put('put', new Buffer(buf), function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res['content-length'], '0');
				assert.strictEqual(res.server, 'AmazonS3');
				s3.get('put', 'buffer', function(err, res) {
					assert.ifError(err);

					assert.deepEqual(res, new Buffer(buf));
					s3.delete('put', function(err, res) {
						assert.ifError(err);

						assert.strictEqual(res.connection, 'close');
						assert.strictEqual(res.server, 'AmazonS3');

						done();
					});
				});
			});
		});
	});

	describe('REMOTE S3 test put buffer with specified x-amz-date', function() {
		it('should upload a file to S3', function(done) {
			var buf = 'S3 PUT test x-amz-date';
			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.setBucket(bucket);
			s3.put('put', {
				'X-amz-Date': new Date().toUTCString()
			}, new Buffer(buf), function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res['content-length'], '0');
				assert.strictEqual(res.server, 'AmazonS3');
				s3.get('put', 'buffer', function(err, res) {
					assert.ifError(err);

					assert.deepEqual(res, new Buffer(buf));
					s3.delete('put', function(err, res) {
						assert.ifError(err);

						assert.strictEqual(res.connection, 'close');
						assert.strictEqual(res.server, 'AmazonS3');

						done();
					});
				});
			});
		});
	});

	describe('REMOTE S3 test create existing bucket', function() {
		it('should make a succesful request, even though the target already exists', function(done) {
			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.createBucket(bucket, 'private', function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res['content-length'], '0');
				assert.strictEqual(res.server, 'AmazonS3');

				done();
			});
		});
	});

	describe('REMOTE S3 test setBucketAcl', function() {
		it('should make a succesful S3 request', function(done) {
			var s3 = new S3(accessKeyId, secretAccessKey);
			s3.setBucketAcl(bucket, 'private', function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res['content-length'], '0');
				assert.strictEqual(res.server, 'AmazonS3');

				done();
			});
		});
	});

});
