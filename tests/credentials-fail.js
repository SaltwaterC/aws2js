var ec2 = require('../').load('ec2');
var assert = require('assert');

ec2.call('DescribeInstances', {}, function (err, res) {
	assert.ok(err instanceof Error);
	assert.deepEqual(err.message, 'You must set the AWS credentials: accessKeyId + secretAccessKey');
});
