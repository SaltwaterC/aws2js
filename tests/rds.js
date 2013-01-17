'use strict';

var common = require('./includes/common.js');

var assert = require('assert');

var rds = require('../').load('rds');

rds.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
rds.setRegion('us-east-1');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0,
	requestWithQuery: 0
};

var rdsProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.DescribeDBInstancesResult.DBInstances);
};

rds.request('DescribeDBInstances', {}, function (err, res) {
	callbacks.request++;
	rdsProcessResponse(err, res);
});

rds.request('DescribeDBInstances', function (err, res) {
	callbacks.requestWithoutQuery++;
	rdsProcessResponse(err, res);
});

rds.request('DescribeDBInstances', {MaxRecords: 20}, function (err, res) {
	callbacks.requestWithQuery++;
	rdsProcessResponse(err, res);
});

common.teardown(callbacks);
