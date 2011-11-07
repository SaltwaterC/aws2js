var assert = require('assert');

var elb = require('../').load('elb');

elb.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
elb.setRegion('us-east-1');

var callbacks = {
	request: false,
	requestWithoutQuery: false
};

var elbProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.DescribeLoadBalancersResult.LoadBalancerDescriptions);
};

elb.request('DescribeLoadBalancers', {}, function (err, res) {
	callbacks.request = true;
	elbProcessResponse(err, res);
});

elb.request('DescribeLoadBalancers', function (err, res) {
	callbacks.requestWithoutQuery = true;
	elbProcessResponse(err, res);
});

process.on('exit', function () {
	for (var i in callbacks) {
		assert.ok(callbacks[i]);
	}
});
