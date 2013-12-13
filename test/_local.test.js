'use strict';

/*global describe: true, it: true, before: true, after: true*/

var ring = require('ring');
var assert = require('chai').assert;

var versions = require('../config/versions.json');

var lib = require('../lib/load.js');

describe('Tests executed on local machine', function() {

	describe('LOCAL aws.js', function() {
		it('should pass all the checks', function(done) {
			var http = require('http');
			var AWS = require('../lib/core/aws.js');

			var aws = new AWS(0, '12345678901234567890', '1234567890123456789012345678901234567890', '0000-00-00');

			var throwAccessKeyId = function() {
				var a = new AWS(0, '');
				assert.isDefined(a); // just to make jslint STFU
			};

			var throwSecretAccessKey = function() {
				var a = new AWS(0, 12345678901234567890);
				assert.isDefined(a);
			};

			assert.strictEqual(aws.getEndPoint(), '0');
			assert.strictEqual(aws.getAccessKeyId(), '12345678901234567890');
			assert.strictEqual(aws.getSecretAccessKey(), '1234567890123456789012345678901234567890');

			assert.throws(throwAccessKeyId, Error, 'The accessKeyId is expected to have a length of 20.');
			assert.throws(throwSecretAccessKey, Error, 'The secretAccessKey is expected to have a length of 40.');

			assert.ok(ring.instance(aws.setEndPoint('foo'), AWS));
			assert.strictEqual(aws.getEndPoint(), 'foo');

			assert.ok(ring.instance(aws.setMaxSockets('foo'), AWS));
			assert.strictEqual(http.Agent.defaultMaxSockets, 5);

			assert.ok(ring.instance(aws.setMaxSockets(10), AWS));
			assert.strictEqual(http.Agent.defaultMaxSockets, 10);

			assert.ok(ring.instance(aws.setPath('/foo'), AWS));
			assert.strictEqual(aws.getPath(), '/foo');

			assert.strictEqual(aws.getRegion(), 'us-east-1');

			assert.ok(ring.instance(aws.setPrefix('foo'), AWS));
			assert.strictEqual(aws.getPrefix(), 'foo');

			assert.ok(ring.instance(aws.setSessionToken('foo'), AWS));
			assert.strictEqual(aws.getSessionToken(), 'foo');

			assert.ok(ring.instance(aws.setCredentials('09876543210987654321', '0987654321098765432109876543210987654321'), AWS));
			assert.strictEqual(aws.getAccessKeyId(), '09876543210987654321');
			assert.strictEqual(aws.getSecretAccessKey(), '0987654321098765432109876543210987654321');

			var throws = function() {
				aws.setApiVersion(0);
			};

			assert.throws(throws, Error, 'The API version doesn\'t match the API version pattern.');

			assert.ok(ring.instance(aws.setApiVersion('2000-02-02'), AWS));
			assert.strictEqual(aws.getApiVersion(), '2000-02-02');

			done();
		});
	});

	describe('LOCAL region.js', function() {
		it('should pass all checks', function(done) {
			var Region = require('../lib/core/region.js');
			var region = new Region();

			// mock the aws.js stuff
			region.getRegion = function() {
				return this.region;
			};

			region.getPrefix = function() {
				return null;
			};

			assert.ok(ring.instance(region.setRegion('abc-def-1'), Region));
			assert.strictEqual(region.getRegion(), 'abc-def-1');

			var throws = function() {
				region.setRegion('invalid-region-pattern');
			};

			assert.throws(throws, Error, 'The region name doesn\'t match the region pattern.');

			done();
		});
	});

	describe('LOCAL signs3.js', function() {
		it('should pass all the checks', function(done) {
			var SignS3 = require('../lib/core/signs3.js');
			var signs3 = new SignS3();

			// mock the aws.js stuff
			signs3.getAccessKeyId = function() {
				return '44CF9590006BF252F707';
			};

			signs3.getSecretAccessKey = function() {
				return 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV';
			};

			signs3.getBucket = function() {
				return 'quotes';
			};

			assert.strictEqual(signs3.createHmacSha1('foo'), 'EsUVJ7fKvKNfAd7Kd+AIXdc0SJ0=');
			assert.strictEqual(signs3.sign('GET', {
				'content-md5': 'c8fdb181845a4ca6b8fec737b3581d76',
				'content-type': 'text/html',
				date: 0
			}, '/quotes/nelson'), 'OkJ8NOvcXny4+AaSJmPV6xsIpG4=');

			done();
		});
	});

	describe('LOCAL signv2.js', function() {
		it('should pass all the checks', function(done) {
			var SignV2 = require('../lib/core/signv2.js');
			var signature = new SignV2();

			// mock the aws.js stuff
			signature.getEndPoint = function() {
				return 'foo';
			};

			signature.getPath = function() {
				return '/';
			};

			signature.getSecretAccessKey = function() {
				return '1234567890123456789012345678901234567890';
			};
			// end mock

			assert.strictEqual(signature.sign({
				foo: 'bar',
				baz: 'qux',
				wibble: 'wobble'
			}), '2dkzUIzAADIDmV783umsfVvngsq0usKmgOjGXwTsbnE=');

			done();
		});
	});

	describe('LOCAL signv3.js', function() {
		it('should pass all the checks', function(done) {
			var SignV3 = require('../lib/core/signv3.js');
			var signature = new SignV3();
			var timestamp = 'Mon, 09 Dec 2013 15:12:24 GMT';

			// mock the aws.js stuff
			signature.getAccessKeyId = function() {
				return '12345678901234567890';
			};

			signature.getSecretAccessKey = function() {
				return '1234567890123456789012345678901234567890';
			};

			assert.strictEqual(signature.sign(timestamp), 'AWS3-HTTPS AWSAccessKeyId=12345678901234567890,Algorithm=HmacSHA256,Signature=HkeyJCXYsuH2LoBFYb5Cjl4Gxi/cQZsihBE8ZNthadQ=');

			done();
		});
	});

	describe('LOCAL signv4.js', function() {
		it('should pass all the checks', function(done) {
			// reproduce the Signature V4 conditions from the AWS docs
			// there's no working implementation to test against
			var SignV4 = require('../lib/core/signv4.js');
			var signature = new SignV4();

			// mock the aws.js stuff
			signature.getPath = function() {
				return '/';
			};

			signature.getRegion = function() {
				return 'us-east-1';
			};

			signature.getPrefix = function() {
				return 'iam';
			};

			signature.getSecretAccessKey = function() {
				return 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY';
			};

			signature.getAccessKeyId = function() {
				return 'AKIAIOSFODNN7EXAMPLE';
			};

			// Task 1: Create a Canonical Request For Signature Version 4
			var headers = {
				host: 'iam.amazonaws.com',
				'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
				'x-amz-date': '20110909T233600Z'
			};

			var body = 'Action=ListUsers&Version=2010-05-08';

			assert.strictEqual(signature.canonicalHeaders(headers), 'content-type:application/x-www-form-urlencoded; charset=utf-8\nhost:iam.amazonaws.com\nx-amz-date:20110909T233600Z\n');
			assert.strictEqual(signature.signedHeaders(headers), 'content-type;host;x-amz-date');
			assert.strictEqual(signature.requestPayload(body), 'b6359072c78d70ebee1e81adcbab4f01bf2c23245fa365ef83fe8f1f955085e2');

			var hashedCanonicalRequest = signature.hashedCanonicalRequest(headers, 'Action=ListUsers&Version=2010-05-08');
			assert.strictEqual(hashedCanonicalRequest, '3511de7e95d28ecd39e9513b642aee07e54f4941150d8df8bf94b328ef7e55e2');

			// Task 2: Create a String to Sign for Signature Version 4
			var timestamp = new Date('Fri, 09 Sep 2011 23:36:00 GMT'); // 20110909T233600Z
			assert.strictEqual(signature.date(timestamp), '20110909');

			var credentialScope = signature.credentialScope(timestamp);
			assert.strictEqual(credentialScope, '20110909/us-east-1/iam/aws4_request');
			assert.strictEqual(signature.iso8601Basic(timestamp), '20110909T233600Z');
			assert.strictEqual(signature.stringToSign(credentialScope, headers, body, timestamp), 'AWS4-HMAC-SHA256\n20110909T233600Z\n20110909/us-east-1/iam/aws4_request\n3511de7e95d28ecd39e9513b642aee07e54f4941150d8df8bf94b328ef7e55e2');

			// Task 3: Calculate the AWS Signature Version 4
			assert.deepEqual(new Buffer(signature.signingKey(timestamp), 'binary'), new Buffer([152, 241, 216, 137, 254, 196, 244, 66, 26, 220, 82, 43, 171, 12, 225, 248, 46, 105, 41, 194, 98, 237, 21, 229, 169, 76, 144, 239, 209, 227, 176, 231]));
			assert.strictEqual(signature.signature(credentialScope, headers, body, timestamp), 'ced6826de92d2bdeed8f846f0bf508e8559e98e4b0199114b84c54174deb456c');

			done();
		});
	});

	describe('LOCAL tools.js', function() {
		it('should pass all the checks', function(done) {
			var tools = require('../lib/core/tools.js');

			assert.strictEqual(tools.absInt('a'), 0);
			assert.strictEqual(tools.absInt({}), 0);
			assert.strictEqual(tools.absInt(1), 1);
			assert.strictEqual(tools.absInt(-1), 1);

			assert.deepEqual(tools.sortObject({
				foo: 'bar',
				baz: 'qux',
				wibble: 'wobble'
			}), {
				baz: 'qux',
				foo: 'bar',
				wibble: 'wobble'
			});

			assert.strictEqual(tools.padInt(9, 2), '09');

			done();
		});
	});

	describe('LOCAL load.js', function() {
		it('should pass all the checks', function(done) {
			var idx, load = require('../lib/load.js');
			var found, idx2, map = require('../config/map.json');

			for (idx in load) {
				if (load.hasOwnProperty(idx) && idx !== 'load') {
					found = false;

					for (idx2 in map) {
						if (map.hasOwnProperty(idx2) && idx === map[idx2]) {
							found = true;
						}
					}

					assert.ok(found);
				}
			}

			done();
		});
	});

	var testQueryClient = function(client, prefix) {
		if (!prefix) {
			prefix = client.toLowerCase();
		}

		describe('LOCAL ' + client.toLowerCase() + '.js', function() {
			it('shoud pass all the checks', function(done) {
				var Client = lib[client];

				var instance = new Client(
					'12345678901234567890',
					'1234567890123456789012345678901234567890',
					'xy-abcd-1'
				);

				assert.strictEqual(instance.getEndPoint(), prefix + '.xy-abcd-1.amazonaws.com');
				assert.strictEqual(instance.getApiVersion(), versions[client]);

				assert.ok(ring.instance(instance.setRegion('ab-wxyz-2'), Client));
				assert.strictEqual(instance.getEndPoint(), prefix + '.ab-wxyz-2.amazonaws.com');

				done();
			});
		});
	};

	testQueryClient('EC2');
	testQueryClient('RDS');
	testQueryClient('ELB', 'elasticloadbalancing');
	testQueryClient('AS', 'autoscaling');
	testQueryClient('CW', 'monitoring');
	testQueryClient('EC', 'elasticache');
	testQueryClient('SQS');
	testQueryClient('CFN', 'cloudformation');
	testQueryClient('SDB');
	testQueryClient('SNS');
	testQueryClient('EMR', 'elasticmapreduce');

	var testQueryClientNoRegion = function(client, endPoint) {
		describe('LOCAL ' + client.toLowerCase() + '.js', function() {
			it('shoud pass all the checks', function(done) {
				var Client = lib[client];

				var instance = new Client(
					'12345678901234567890',
					'1234567890123456789012345678901234567890'
				);

				assert.strictEqual(instance.getEndPoint(), endPoint);
				assert.strictEqual(instance.getApiVersion(), versions[client]);

				done();
			});
		});
	};

	testQueryClientNoRegion('SES', 'email.us-east-1.amazonaws.com');
	testQueryClientNoRegion('IAM', 'iam.amazonaws.com');
	testQueryClientNoRegion('STS', 'sts.amazonaws.com');

	var testQueryClientSTS = function(client, host) {
		if (!host) {
			host = client.toLowerCase();
		}

		describe('LOCAL ' + client.toLowerCase() + '.js', function() {
			it('shoud pass all the checks', function(done) {
				var Client = lib[client];

				var instance = new Client(
					'12345678901234567890',
					'1234567890123456789012345678901234567890',
					'mockSessionToken',
					'xy-abcd-1'
				);

				assert.strictEqual(instance.getEndPoint(), host + '.xy-abcd-1.amazonaws.com');
				assert.strictEqual(instance.getApiVersion(), versions[client]);

				instance.setRegion('ab-wxyz-2');
				assert.strictEqual(instance.getEndPoint(), host + '.ab-wxyz-2.amazonaws.com');

				done();
			});
		});
	};

	testQueryClientSTS('DDB', 'dynamodb');

	describe('LOCAL s3.js', function() {
		it('should pass all the checks', function(done) {
			var S3 = lib.S3;
			var s3 = new S3('12345678901234567890', '1234567890123456789012345678901234567890');

			assert.strictEqual(s3.getEndPoint(), 's3.amazonaws.com');
			assert.strictEqual(s3.getRegion(), 'us-east-1');

			assert.ok(ring.instance(s3.setRegion('ab-cdef-1'), S3));
			assert.strictEqual(s3.getRegion(), 'ab-cdef-1');

			assert.ok(ring.instance(s3.setBucket('foo'), S3));
			assert.strictEqual(s3.getBucket(), 'foo');

			// if this changes ...
			assert.strictEqual(s3.getApiVersion(), '2006-03-01');

			done();
		});
	});

});
