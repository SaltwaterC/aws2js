'use strict';

var common = require('./includes/common.js');

var assert = require('assert');

var ses = require('../').load('ses');

ses.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

try {
	ses.setRegion('us-east-1');
} catch (e) {
	assert.ok(e instanceof Error);
}

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var sesProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.ListVerifiedEmailAddressesResult.VerifiedEmailAddresses);
};

ses.request('ListVerifiedEmailAddresses', {}, function (err, res) {
	callbacks.request++;
	sesProcessResponse(err, res);
});

ses.request('ListVerifiedEmailAddresses', function (err, res) {
	callbacks.requestWithoutQuery++;
	sesProcessResponse(err, res);
});

common.teardown(callbacks);
