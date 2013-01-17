'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var s3 = require('../').load('s3');
var callbacks = {
	get: 0
};

assert.ok(process.env.AWS2JS_S3_BUCKET !== undefined);

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.head('/', function (err, res) {
	callbacks.get++;
	assert.ifError(err);
	assert.deepEqual(res.server, 'AmazonS3');
});

common.teardown(callbacks);
