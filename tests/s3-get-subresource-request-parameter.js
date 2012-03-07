var assert = require('assert');
var s3 = require('../').load('s3');

var callbacks = {
	query: false,
	path: false
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.get('?uploads', {'max-uploads': 1}, 'xml', function (err, res) {
	callbacks.query = true;
	assert.ifError(err);
	assert.deepEqual(res.Bucket, process.env.AWS2JS_S3_BUCKET);
	assert.equal(res.MaxUploads, 1);
});


s3.get('?uploads&max-uploads=1', 'xml', function (err, res) {
	callbacks.path = true;
	assert.ifError(err);
	assert.deepEqual(res.Bucket, process.env.AWS2JS_S3_BUCKET);
	assert.equal(res.MaxUploads, 1);
});

process.on('exit', function () {
	for (var i in callbacks) {
		assert.ok(callbacks[i]);
	}
});
