'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

var versions = require('../config/versions.json');

var lib = require('../lib/load.js');

describe('Tests executed on local machine', function() {

	describe('LOCAL aws.js', function() {
		it('should pass all the checks', function(done) {
			var http = require('http');
			var AWS = require('../lib/core/aws.js');

			var aws = new AWS(0, 12345678901234567890, "1234567890123456789012345678901234567890");

			var throwAccessKeyId = function() {
				var a = new AWS(0, '');
				assert.isDefined(a); // just to make jslint STFU
			};

			var throwSecretAccessKey = function() {
				var a = new AWS(0, 12345678901234567890);
				assert.isDefined(a);
			};

			assert.isString(aws.getEndPoint());
			assert.isString(aws.getAccessKeyId());
			assert.isString(aws.getSecretAccessKey());

			assert.throws(throwAccessKeyId, Error, 'The accessKeyId is expected to have a length of 20.');
			assert.throws(throwSecretAccessKey, Error, 'The secretAccessKey is expected to have a length of 40.');

			aws.setEndPoint('foo');
			assert.strictEqual(aws.getEndPoint(), 'foo');

			aws.setMaxSockets('foo');
			assert.strictEqual(http.Agent.defaultMaxSockets, 5);

			aws.setMaxSockets(10);
			assert.strictEqual(http.Agent.defaultMaxSockets, 10);

			aws.setPath('/foo');
			assert.strictEqual(aws.getPath(), '/foo');

			assert.strictEqual(aws.getRegion(), 'us-east-1');

			aws.setPrefix('foo');
			assert.strictEqual(aws.getPrefix(), 'foo');

			aws.setSessionToken('foo');
			assert.strictEqual(aws.getSessionToken(), 'foo');

			done();
		});
	});

	describe('LOCAL query.js', function() {
		it('should pass all the checks', function(done) {
			var Query = require('../lib/core/query.js');

			var query = new Query({
				endPoint: 'foo',
				accessKeyId: '12345678901234567890',
				secretAccessKey: '1234567890123456789012345678901234567890',
				apiVersion: 0
			});

			assert.isString(query.getApiVersion());
			assert.strictEqual(query.getApiVersion(), '0');

			done();
		});
	});

	describe('LOCAL region.js', function() {
		it('should pass all checks', function(done) {
			var Region = require('../lib/core/region.js');
			var region = new Region();
			region.setRegion('abc-def-1');

			// mock the aws.js stuff
			region.getRegion = function() {
				return this.region;
			};

			assert.strictEqual(region.getRegion(), 'abc-def-1');

			var throws = function() {
				region.setRegion('invalid-region-pattern');
			};

			assert.throws(throws, Error, 'The region name doesn\'t match the region pattern.');

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
	
	describe('LOCAL signv4.js', function () {
		it('should pass all the checks', function (done) {
			// XXX
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

	var testQueryClient = function(client, host) {
		if (!host) {
			host = client.toLowerCase();
		}

		describe('LOCAL ' + client.toLowerCase() + '.js', function() {
			it('shoud pass all the checks', function(done) {
				var Client = lib[client];

				var instance = new Client(
					'12345678901234567890',
					'1234567890123456789012345678901234567890',
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

	testQueryClient('EC2');
	testQueryClient('RDS');
	testQueryClient('ELB', 'elasticloadbalancing');
	testQueryClient('AS', 'autoscaling');
	testQueryClient('CW', 'monitoring');
	testQueryClient('EC', 'elasticache');
	testQueryClient('SQS');
	testQueryClient('CFN', 'cloudformation');
	testQueryClient('SDB');

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
});
