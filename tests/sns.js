'use strict';

var common = require('./includes/common.js');

var assert = require('assert');

var sns = require('../').load('sns');

sns.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
sns.setRegion('us-east-1');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var snsProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.ListSubscriptionsResult.Subscriptions);
};

sns.request('ListSubscriptions', {}, function (err, res) {
	callbacks.request++;
	snsProcessResponse(err, res);
});

sns.request('ListSubscriptions', function (err, res) {
	callbacks.requestWithoutQuery++;
	snsProcessResponse(err, res);
});

common.teardown(callbacks);
