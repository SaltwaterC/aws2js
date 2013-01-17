'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var s3 = require('../').load('s3');

var callbacks = {
	putLifeCycleRule1: 0,
	putLifeCycleRule2: 0,
	delLifeCycleRule1: 0,
	delLifeCycleRule2: 0
};

var timestamp = new Date().getTime();

var showError = function (err) {
	if (err) {
		console.error(err);
	}
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.delLifeCycle(function (error, response) {
	console.log('s3.delLifeCycle');
	showError(error);
	assert.ifError(error);
	
	s3.putLifeCycleRule('id', 'prefix-' + timestamp, 5, function (error, response) {
		callbacks.putLifeCycleRule1++;
		
		console.log('s3.putLifeCycleRule: id, prefix-' + timestamp);
		showError(error);
		assert.ifError(error);
		
		s3.putLifeCycleRule('id2', 'otherprefix-' + timestamp, 5, function (error, response) {
			callbacks.putLifeCycleRule2++;
			
			console.log('s3.putLifeCycleRule: id2, otherprefix-' + timestamp);
			showError(error);
			assert.ifError(error);
			
			setTimeout(function () {
				s3.delLifeCycleRule('id', function(error, response) {
					callbacks.delLifeCycleRule1++;
					
					console.log('s3.delLifeCycleRule: id');
					showError(error);
					assert.ifError(error);
					
					s3.delLifeCycleRule('id2', function(error, response) {
						callbacks.delLifeCycleRule2++;
						
						console.log('s3.delLifeCycleRule: id2');
						showError(error);
						assert.ifError(error);
					});
				});
			}, 18000);
		});
	});
});

common.teardown(callbacks);
