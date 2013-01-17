'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var s3 = require('../').load('s3');
var path = 'foo.pdf';

var callbacks = {
	put: 0,
	head: 0,
	del: 0
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.putFile(path, './data/foo.pdf', false, {}, function (err, res) {
	callbacks.put++;
	assert.ifError(err);
	s3.head(path, function (err, res) {
		callbacks.head++;
		assert.ifError(err);
		assert.deepEqual(res['content-type'], 'application/pdf');
		s3.del(path, function (err) {
			callbacks.del++;
			assert.ifError(err);
		});
	});
});

common.teardown(callbacks);
