'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var autoscaling = require('../').load('autoscaling');

autoscaling.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
autoscaling.setRegion('us-east-1');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var autoscalingProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.DescribeScalingActivitiesResult.Activities);
};

autoscaling.request('DescribeScalingActivities', {}, function (err, res) {
	callbacks.request++;
	autoscalingProcessResponse(err, res);
});

autoscaling.request('DescribeScalingActivities', function (err, res) {
	callbacks.requestWithoutQuery++;
	autoscalingProcessResponse(err, res);
});

common.teardown(callbacks);
