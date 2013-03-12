'use strict';

var common = require('./includes/common.js');

var http = require('http-get');
var assert = require('assert');
var s3 = require('../').load('s3');

var path = 'foo.png';

var callbacks = {
	put: 0,
	headSign: 0,
	headFail: 0,
	del: 0
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.putFile(path, './data/foo.png', false, {}, function (err, res) {
	callbacks.put++;
	assert.ifError(err);
	console.log('s3.putFile');
	
	var time = new Date();
	time.setMinutes(time.getMinutes() + 60);
	
	var url = s3.signUrl('https', 'HEAD', path, time);
	http.head({url: url}, function (err, res) {
		callbacks.headSign++;
		assert.ifError(err);
		console.log('s3.head + s3.signUrl');
		
		assert.deepEqual(res.headers['content-type'], 'image/png');
		
		http.head({url: 'https://s3.amazonaws.com' + '/' + s3.getBucket() + '/' + path}, function (err, res) {
			callbacks.headFail++;
			assert.ok(err instanceof Error);
			assert.deepEqual(err.code, 403);
			
			console.log('s3.head + fail url');
			
			s3.del(path, function (err) {
				callbacks.del++;
				assert.ifError(err);
				
				console.log('s3.del');
			});
		});
	});
});

common.teardown(callbacks);
