'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var s3 = require('../').load('s3');

var callbacks = {
	query: 0,
	path: 0
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

var s3ProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.deepEqual(res.Name, process.env.AWS2JS_S3_BUCKET);
	assert.equal(res.MaxKeys, 1);
};

s3.get('/', {'max-keys': 1, prefix: '/'}, 'xml', function (err, res) {
	callbacks.query++;
	s3ProcessResponse(err, res);
});


s3.get('/?max-keys=1&prefix=/', 'xml', function (err, res) {
	callbacks.path++;
	s3ProcessResponse(err, res);
});

common.teardown(callbacks);
