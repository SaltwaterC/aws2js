'use strict';

var common = require('./includes/common.js');

var assert = require('assert');

var elb = require('../').load('elb');

elb.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
elb.setRegion('us-east-1');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var elbProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.DescribeLoadBalancersResult.LoadBalancerDescriptions);
};

elb.request('DescribeLoadBalancers', {}, function (err, res) {
	callbacks.request++;
	elbProcessResponse(err, res);
});

elb.request('DescribeLoadBalancers', function (err, res) {
	callbacks.requestWithoutQuery++;
	elbProcessResponse(err, res);
});

common.teardown(callbacks);
