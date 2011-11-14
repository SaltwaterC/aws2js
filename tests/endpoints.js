var assert = require('assert');
var aws = require('../');
var config = require('../lib/config.js');
var suffix = config.suffix; 

var clients = {
	ec2: config.clients.ec2.prefix,
	rds: config.clients.rds.prefix,
	elb: config.clients.elb.prefix,
	autoscaling: config.clients.autoscaling.prefix,
	cloudwatch: config.clients.cloudwatch.prefix
};

for (var client in clients) {
	var prefix = clients[client];
	var cl = aws.load(client);
	assert.deepEqual(cl.getEndPoint(), prefix + suffix);
	cl.setRegion('eu-west-1');
	assert.deepEqual(cl.getEndPoint(), prefix + '.eu-west-1' + suffix);
}

var ses = aws.load('ses');
assert.deepEqual(ses.getEndPoint(), 'email.us-east-1' + suffix);

var iam = aws.load('iam');
assert.deepEqual(iam.getEndPoint(), 'iam' + suffix);

var ec = aws.load('elasticache');
assert.deepEqual(ec.getEndPoint(), 'elasticache.us-east-1' + suffix);

var s3 = aws.load('s3');
assert.deepEqual(s3.getEndPoint(), 's3' + suffix);
s3.setBucket('foo');
assert.deepEqual(s3.getEndPoint(), 'foo.s3' + suffix);
s3.setEndPoint('bar');
assert.deepEqual(s3.getEndPoint(), 'bar.s3' + suffix);
