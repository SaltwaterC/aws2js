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

cp.execFile('../tools/createtemp.sh', function (err, res) {
	assert.ifError(err);	
	util.log('generated the 6M.tmp file');
	
	var tempMd5 = res.replace(/\s/g, '');
	
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
				assert.deepEqual(tempMd5, dlMd5);
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

var caught = false;
process.on('uncaughtException', function (err) {
	fs.unlink(file, function () {
		if ( ! caught) {
			caught = true;
			throw err;
		} else {
			process.exit(1);
		}
	});
});

common.teardown(callbacks);
