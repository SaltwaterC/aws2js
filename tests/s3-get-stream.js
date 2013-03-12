'use strict';

var common = require('./includes/common.js');

var Stream = require('stream').Stream;
var assert = require('assert');
var s3 = require('../').load('s3');
var path = 'foo.txt';

var callbacks = {
	put: 0,
	get: 0,
	del: 0
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.putFile(path, './data/foo.txt', false, {}, function (err, res) {
	callbacks.put++;
	assert.ifError(err);
	s3.get(path, 'stream', function (err, res) {
		callbacks.get++;
		assert.ifError(err);
		
		assert.ok(res instanceof Stream);
		res.resume();
		
		s3.del(path, function (err) {
			callbacks.del++;
			assert.ifError(err);
		});
	});
});

common.teardown(callbacks);
