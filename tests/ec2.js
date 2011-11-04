var assert = require('assert');
var ec2 = require('../').load('ec2');

ec2.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
ec2.setRegion('us-east-1');

var callbacks = {
	call: false,
	callWithoutQuery: false,
	callWithFilter: false
};

var ec2ProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.reservationSet);
};

ec2.call('DescribeInstances', {}, function (err, res) {
	callbacks.call = true;
	ec2ProcessResponse(err, res);
});

ec2.call('DescribeInstances', function (err, res) {
	callbacks.callWithoutQuery = true;
	ec2ProcessResponse(err, res);
});

ec2.call('DescribeInstances', {'Filter.1.Name': 'architecture', 'Filter.1.Value.1': 'i386'}, function (err, res) {
	callbacks.callWithFilter = true;
	ec2ProcessResponse(err, res);
});

process.on('exit', function () {
	for (var i in callbacks) {
		assert.ok(callbacks[i]);
	}
});
