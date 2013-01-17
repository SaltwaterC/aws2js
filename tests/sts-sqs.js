'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var aws = require('../');
var sts = aws.load('sts', process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
var sqs = aws.load('sqs');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var sqsProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.ListQueuesResult.QueueUrl);
};

sts.request('GetSessionToken', function (err, res) {
	assert.ifError(err);
	
	var credentials = res.GetSessionTokenResult.Credentials;
	sqs.setCredentials(credentials.AccessKeyId, credentials.SecretAccessKey, credentials.SessionToken);
	sqs.setRegion('us-east-1');
	
	sqs.request('ListQueues', {}, function (err, res) {
		callbacks.request++;
		sqsProcessResponse(err, res);
	});
	
	sqs.request('ListQueues', function (err, res) {
		callbacks.requestWithoutQuery++;
		sqsProcessResponse(err, res);
	});
});

common.teardown(callbacks);
