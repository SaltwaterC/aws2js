'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on SQS', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var SQS = require('../lib/load.js').SQS;

	var handleResponse = function(err, res, done) {
		console.log(err.document.toString());
		assert.ifError(err);

		assert.ok(res.requestId);
		assert.ok(res.reservationSet);

		done();
	};

	describe('REMOTE SQS test without query argument', function() {
		it('should make a succesful SQS request', function(done) {
			var sqs = new SQS(accessKeyId, secretAccessKey);
			sqs.request('ListQueues', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE SQS test with empty query argument', function() {
		it('should make a succesful SQS request', function(done) {
			var sqs = new SQS(accessKeyId, secretAccessKey);
			sqs.request('ListQueues', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
