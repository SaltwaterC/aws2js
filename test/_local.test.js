'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

var versions = require('../config/versions.json');

var lib = require('../lib/load.js');

describe('Tests executed on local machine', function() {

	describe('LOCAL tools.js', function() {
		it('should pass all the checks', function(done) {
			var tools = require('../lib/tools.js');

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

	describe('LOCAL aws.js', function() {
		it('should pass all the checks', function(done) {
			var http = require('http');
			var AWS = require('../lib/aws.js');

			var aws = new AWS(0, 12345678901234567890, "1234567890123456789012345678901234567890");

			var throwAccessKeyId = function() {
				var a = new AWS(0, '');
				assert.isDefined(a); // just to make jslint STFU
			};

			var throwSecretAccessKey = function() {
				var a = new AWS(0, 12345678901234567890);
				assert.isDefined(a);
			};

			assert.isString(aws.endPoint);
			assert.isString(aws.accessKeyId);
			assert.isString(aws.secretAccessKey);

			assert.throws(throwAccessKeyId, Error, 'The accessKeyId is expected to have a length of 20.');
			assert.throws(throwSecretAccessKey, Error, 'The secretAccessKey is expected to have a length of 40.');

			aws.setEndPoint('foo');
			assert.strictEqual(aws.getEndPoint(), 'foo');

			aws.setMaxSockets('foo');
			assert.strictEqual(http.Agent.defaultMaxSockets, 5);

			aws.setMaxSockets(10);
			assert.strictEqual(http.Agent.defaultMaxSockets, 10);

			done();
		});
	});

	describe('LOCAL query.js', function() {
		it('should pass all the checks', function(done) {
			var Query = require('../lib/query.js');

			var query = new Query({
				endPoint: 'foo',
				accessKeyId: '12345678901234567890',
				secretAccessKey: '1234567890123456789012345678901234567890',
				apiVersion: 0
			});

			assert.isString(query.apiVersion);
			assert.strictEqual(query.getApiVersion(), '0');
			assert.strictEqual(query.sign({
				foo: 'bar',
				baz: 'qux',
				wibble: 'wobble'
			}), '2dkzUIzAADIDmV783umsfVvngsq0usKmgOjGXwTsbnE=');

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
});
