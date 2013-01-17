'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var s3 = require('../').load('s3');
var path1 = '/foo1.png';
var path2 = '/foo2.png';

var callbacks = {
	put1: 0,
	head1: 0,
	put2: 0,
	head2: 0,
	del: 0
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.putFile(path1, './data/foo.png', false, {}, function (err, res) {
	callbacks.put1++;
	assert.ifError(err);
	
	s3.head(path1, function (err, res) {
		callbacks.head1++;
		assert.ifError(err);
		assert.deepEqual(res['content-type'], 'image/png');
		
		s3.putFile(path2, './data/foo.png', false, {}, function (err, res) {
			callbacks.put2++;
			assert.ifError(err);
			
			s3.head(path2, function (err, res) {
				callbacks.head2++;
				assert.ifError(err);
				assert.deepEqual(res['content-type'], 'image/png');
				
				var objects = [
					{
						key: path1
					},
					{
						key: path2
					}
				];
				
				s3.delMultiObjects(objects, function (err, res) {
					callbacks.del++;
					assert.ifError(err);
					
					assert.ok(res.Deleted);
					assert.ok(res.Deleted[0]);
					assert.ok(res.Deleted[1]);
				});
			});
		});
	});
});

common.teardown(callbacks);
