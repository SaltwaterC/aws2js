var ec2 = require('../').load('ec2');
var assert = require('assert');

var callback = false;

ec2.request('DescribeInstances', {}, function (err, res) {
	callback = true;
	assert.ok(err instanceof Error);
	assert.deepEqual(err.message, 'You must set the AWS credentials: accessKeyId + secretAccessKey');
});

process.on('exit', function () {
	assert.ok(callback);
});
