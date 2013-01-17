'use strict';

var common = require('./includes/common.js');

var assert = require('assert');

var emr = require('../').load('emr');

emr.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var emrProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.DescribeJobFlowsResult.JobFlows);
};

emr.request('DescribeJobFlows', {}, function (err, res) {
	callbacks.request++;
	emrProcessResponse(err, res);
});

emr.request('DescribeJobFlows', function (err, res) {
	callbacks.requestWithoutQuery++;
	emrProcessResponse(err, res);
});

common.teardown(callbacks);
