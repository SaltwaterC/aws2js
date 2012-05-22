var assert = require('assert');
var s3 = require('../').load('s3');

var callbacks = {
	putLifeCycleRule1: false,
	putLifeCycleRule2: false,
	delLifeCycleRule1: false,
	delLifeCycleRule2: false
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.putLifeCycleRule('id', 'prefix', 5, function (error, response) {
	callbacks.putLifeCycleRule1 = true;
	assert.ifError(error);
	
	s3.putLifeCycleRule('id2', 'otherprefix', 5, function (error, response) {
		callbacks.putLifeCycleRule2 = true;
		assert.ifError(error);
		
		s3.delLifeCycleRule('id', function(error, response) {
			callbacks.delLifeCycleRule1 = true;
			assert.ifError(error);
			
			s3.delLifeCycleRule('id2', function(error, response) {
				callbacks.delLifeCycleRule2 = true;
				assert.ifError(error);
			});
		});
	});
});

process.on('exit', function () {
	for (var i in callbacks) {
		assert.ok(callbacks[i]);
	}
});
