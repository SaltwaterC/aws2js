'use strict';

var common = require('./includes/common.js');

var fs = require('fs');
var assert = require('assert');
var s3 = require('../').load('s3');
var path = 'foo-buffer.txt';

var callbacks = {
	put: 0,
	get: 0,
	del: 0
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

fs.readFile('./data/foo.txt', function (err, buffer) {
	assert.ifError(err);
	
	s3.putBuffer(path, buffer, false, {'content-type': 'text/plain'}, function (err, res) {
		callbacks.put++;
		assert.ifError(err);
		s3.get(path, 'buffer', function (err, res) {
			callbacks.get++;
			assert.ifError(err);
			assert.deepEqual(res.headers['content-type'], 'text/plain');
			assert.deepEqual(res.buffer.toString(), 'bar\n');
			s3.del(path, function (err) {
				callbacks.del++;
				assert.ifError(err);
			});
		});
	});
});

common.teardown(callbacks);
