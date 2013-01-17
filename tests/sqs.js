'use strict';

var common = require('./includes/common.js');

var assert = require('assert');

var sqs = require('../').load('sqs');

sqs.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
sqs.setRegion('us-east-1');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var sqsProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.ListQueuesResult.QueueUrl);
};

sqs.request('ListQueues', {}, function (err, res) {
	callbacks.request++;
	sqsProcessResponse(err, res);
});

sqs.request('ListQueues', function (err, res) {
	callbacks.requestWithoutQuery++;
	sqsProcessResponse(err, res);
});

common.teardown(callbacks);
