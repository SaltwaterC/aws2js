'use strict';

var common = require('./includes/common.js');

var assert = require('assert');

var cloudformation = require('../').load('cloudformation');

cloudformation.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
cloudformation.setRegion('us-east-1');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var cloudformationProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.DescribeStacksResult.Stacks);
};

cloudformation.request('DescribeStacks', {}, function (err, res) {
	callbacks.request++;
	cloudformationProcessResponse(err, res);
});

cloudformation.request('DescribeStacks', function (err, res) {
	callbacks.requestWithoutQuery++;
	cloudformationProcessResponse(err, res);
});

common.teardown(callbacks);
