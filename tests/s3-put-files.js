'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var s3 = require('../').load('s3');

var callbacks = {
	put: 0,
	del: 0,
	idx0: 0,
	idx1: 0
};

var callbacksHead = [0, 0];

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

var files = [
	{
		path: 'm_foo.pdf',
		file: './data/foo.pdf'
	},
	{
		path: 'm_foo.png',
		file: './data/foo.png'
	}
];

s3.putFiles(files, false, {}, function (errors, results) {
	callbacks.put++;
	
	var idx;
	for (idx in errors) {
		if (errors.hasOwnProperty(idx)) {
			assert.ifError(errors[idx]);
		}
	}
	
	var headCount = files.length;
	
	var cleanup = function () {
		if (headCount === 0) {
			var objects = [
				{
					key: 'm_foo.pdf'
				},
				{
					key: 'm_foo.png'
				}
			];
			s3.delMultiObjects(objects, function (err, res) {
				assert.ifError(err);
				callbacks.del++;
			});
		}
	};
	
	files.forEach(function (element, index) {
		s3.head(element.path, function (err, res) {
			callbacks['idx' + index]++;
			assert.ifError(err);
			headCount--;
			cleanup();
		});
	});
});

common.teardown(callbacks);
