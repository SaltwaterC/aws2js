'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var ec2 = require('../').load('ec2');

ec2.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
ec2.setRegion('us-east-1');

var callbacks = {
	request: 0,
	requestWithoutQuery: 0,
	requestWithFilter: 0
};

var ec2ProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.reservationSet);
};

ec2.request('DescribeInstances', {}, function (err, res) {
	callbacks.request++;
	ec2ProcessResponse(err, res);
});

ec2.request('DescribeInstances', function (err, res) {
	callbacks.requestWithoutQuery++;
	ec2ProcessResponse(err, res);
});

ec2.request('DescribeInstances', {'Filter.1.Name': 'architecture', 'Filter.1.Value.1': 'i386'}, function (err, res) {
	callbacks.requestWithFilter++;
	ec2ProcessResponse(err, res);
});

common.teardown(callbacks);
