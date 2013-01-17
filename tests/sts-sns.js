'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var aws = require('../');
var sts = aws.load('sts', process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
var sns = aws.load('sns');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var snsProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.ListSubscriptionsResult.Subscriptions);
};

sts.request('GetSessionToken', function (err, res) {
	assert.ifError(err);
	
	var credentials = res.GetSessionTokenResult.Credentials;
	sns.setCredentials(credentials.AccessKeyId, credentials.SecretAccessKey, credentials.SessionToken);
	sns.setRegion('us-east-1');
	
	sns.request('ListSubscriptions', {}, function (err, res) {
		callbacks.request++;
		snsProcessResponse(err, res);
	});
	
	sns.request('ListSubscriptions', function (err, res) {
		callbacks.requestWithoutQuery++;
		snsProcessResponse(err, res);
	});
});

common.teardown(callbacks);
