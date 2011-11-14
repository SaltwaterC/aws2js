var assert = require('assert');
var s3 = require('../').load('s3');
var path = 'foo~!@#$&*()=:,;?+\'.txt';

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.putObject(path, './data/foo.txt', false, {}, function (err, res) {
	assert.ifError(err);
	s3.get(path, 'buffer', function (err, res) {
		assert.ifError(err);
		assert.deepEqual(res.headers['content-type'], 'text/plain');
		assert.deepEqual(res.buffer, 'bar\n');
		s3.del(path, function (err) {
			assert.ifError(err);
		});
	});
});
