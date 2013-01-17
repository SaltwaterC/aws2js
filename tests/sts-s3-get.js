'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var aws = require('../');
var sts = aws.load('sts', process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
var s3 = aws.load('s3');

var callbacks = {
	get: 0
};

sts.request('GetSessionToken', function (err, res) {
	var credentials = res.GetSessionTokenResult.Credentials;
	assert.ifError(err);
	
	s3.setCredentials(credentials.AccessKeyId, credentials.SecretAccessKey, credentials.SessionToken);
	
	s3.get('/', 'xml', function (err, res) {
		callbacks.get++;
		assert.ifError(err);
		assert.ok(res.Buckets);
	});
});

common.teardown(callbacks);
