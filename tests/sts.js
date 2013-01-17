'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var sts = require('../').load('sts');

sts.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

try {
	sts.setRegion('us-east-1');
} catch (e) {
	assert.ok(e instanceof Error);
}

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var stsProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.GetSessionTokenResult.Credentials);
};

sts.request('GetSessionToken', {}, function (err, res) {
	callbacks.request++;
	stsProcessResponse(err, res);
});

sts.request('GetSessionToken', function (err, res) {
	callbacks.requestWithoutQuery++;
	stsProcessResponse(err, res);
});

common.teardown(callbacks);
