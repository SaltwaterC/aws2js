'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var iam = require('../').load('iam');

iam.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

try {
	iam.setRegion('us-east-1');
} catch (e) {
	assert.ok(e instanceof Error);
}

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var iamProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.ListUsersResult.Users);
};

iam.request('ListUsers', {}, function (err, res) {
	callbacks.request++;
	iamProcessResponse(err, res);
});

iam.request('ListUsers', function (err, res) {
	callbacks.requestWithoutQuery++;
	iamProcessResponse(err, res);
});

common.teardown(callbacks);
