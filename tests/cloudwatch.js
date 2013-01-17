'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var cloudwatch = require('../').load('cloudwatch');

cloudwatch.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
cloudwatch.setRegion('us-east-1');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var cloudwatchProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.DescribeAlarmsResult.MetricAlarms);
};

cloudwatch.request('DescribeAlarms', {}, function (err, res) {
	callbacks.request++;
	cloudwatchProcessResponse(err, res);
});

cloudwatch.request('DescribeAlarms', function (err, res) {
	callbacks.requestWithoutQuery++;
	cloudwatchProcessResponse(err, res);
});

common.teardown(callbacks);
