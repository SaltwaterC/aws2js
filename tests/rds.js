var assert = require('assert');

var rds = require('../').load('rds');

rds.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
rds.setRegion('us-east-1');

var callbacks = {
	call: false,
	callWithoutQuery: false,
	callWithQuery: false
};

var rdsProcessResponse = function (err, res, cb) {
	assert.ifError(err);
	assert.ok(res.DescribeDBInstancesResult.DBInstances);
};

rds.call('DescribeDBInstances', {}, function (err, res) {
	callbacks.call = true;
	rdsProcessResponse(err, res);
});

rds.call('DescribeDBInstances', function (err, res) {
	callbacks.callWithoutQuery = true;
	rdsProcessResponse(err, res);
});

rds.call('DescribeDBInstances', {MaxRecords: 20}, function (err, res) {
	callbacks.callWithQuery = true;
	rdsProcessResponse(err, res);
});

process.on('exit', function () {
	for (var i in callbacks) {
		assert.ok(callbacks[i]);
	}
});
