'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var s3 = require('../').load('s3');
var source = 'foo.png';
var destination = 'bar.png';

var callbacks = {
	putFile: 0,
	renameObject: 0,
	head: 0,
	delDestination: 0
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.putFile(source, './data/foo.png', false, {}, function (err, res) {
	callbacks.putFile++;
	assert.ifError(err);
	
	s3.moveObject(s3.getBucket() + '/' + source, destination, false, {}, function (err, res) {
		callbacks.renameObject++;
		assert.ifError(err);
		
		s3.head(destination, function (err, res) {
			callbacks.head++;
			assert.ifError(err);
			assert.deepEqual(res['content-type'], 'image/png');
			
			s3.del(destination, function (err, res) {
				callbacks.delDestination++;
				assert.ifError(err);
			});
		});
	});
});

common.teardown(callbacks);
