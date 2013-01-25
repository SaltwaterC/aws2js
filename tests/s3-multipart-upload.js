'use strict';

var common = require('./includes/common.js');

var fs = require('fs');
var util = require('util');
var assert = require('assert');
var crypto = require('crypto');
var cp = require('child_process');

var s3 = require('../').load('s3');

var file = '6M.tmp';

var callbacks = {
	putFileMultipart: 0
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

crypto.randomBytes(6291456, function (err, buf) {
	assert.ifError(err);
	
	var tempMd5 = crypto.createHash('md5');
	tempMd5.update(buf);
	tempMd5 = tempMd5.digest('hex');
	
	util.log(util.format('have %d bytes of random data with md5 hash %s', buf.length, tempMd5));
	
	fs.writeFile(file, buf, function (err) {
		assert.ifError(err);
		util.log('wrote the random data file');
		
		s3.putFileMultipart(file, file, false, {}, 5242880, function (err, res) {
			assert.ifError(err);
			callbacks.putFileMultipart++;
			
			util.log('uploaded the 6M.tmp file to S3');
			
			s3.get(file, {file: file}, function (err, res) {
				assert.ifError(err);
				
				util.log('got the file back from S3');
				
				var md5 = crypto.createHash('md5');
				
				var rs = fs.ReadStream(file);
				rs.on('data', function (data) {
					md5.update(data);
				});
				
				rs.on('end', function () {
					var dlMd5 = md5.digest('hex');
					assert.strictEqual(tempMd5, dlMd5);
					
					fs.unlink(file, function (err) {
						assert.ifError(err);
						
						s3.del(file, function (err, res) {
							assert.ifError(err);
							util.log('cleaned up the S3 remote');
						});
					});
				});
				
				rs.on('error', function (err) {
					assert.ifError(err);
				});
			});
		});
	});
});

common.teardown(callbacks);
