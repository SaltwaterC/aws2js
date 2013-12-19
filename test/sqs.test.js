'use strict';

/*global describe: true, it: true*/

var assert = require('chai').assert;

describe('Tests executed on SQS', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var SQS = require('../lib/load.js').SQS;
	var STS = require('../lib/load.js').STS;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);

		assert.ok(res.ResponseMetadata);
		assert.ok(res.ListQueuesResult);

		done();
	};

	describe('REMOTE SQS test with empty query argument', function() {
		it('should make a succesful SQS request', function(done) {
			var sqs = new SQS(accessKeyId, secretAccessKey);
			sqs.request('ListQueues', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE SQS test with setQueue', function() {
		it('should make a succesful SQS request', function(done) {
			var sqs = new SQS(accessKeyId, secretAccessKey);
			sqs.setQueue(process.env.AWS2JS_SQS_QUEUE);
			sqs.request('GetQueueAttributes', function(err, res) {
				assert.ifError(err);

				assert.ok(res.ResponseMetadata);
				assert.ok(res.GetQueueAttributesResult);

				done();
			});
		});
	});

	describe('REMOTE SQS test with STS credentials', function() {
		it('should make a succesful SQS request', function(done) {
			var sts = new STS(accessKeyId, secretAccessKey);
			sts.request('GetSessionToken', function(err, res) {
				assert.ifError(err);

				var credentials = res.GetSessionTokenResult.Credentials;
				var sqs = new SQS(credentials.AccessKeyId, credentials.SecretAccessKey);
				sqs.setSessionToken(credentials.SessionToken);

				sqs.request('ListQueues', function(err, res) {
					handleResponse(err, res, done);
				});
			});
		});
	});

});
