'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

// read the credentials from the environment
var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// define the service clients
var EC2 = require('../lib/ec2.js');

describe('REMOTE tests', function () {
	
	describe('REMOTE EC2 test', function () {
		it('should make a succesful EC2 call', function (done) {
			var ec2 = new EC2(accessKeyId, secretAccessKey);
			
			ec2.request('DescribeInstances', function (err, res) {
				assert.ifError(err);
				
				assert.ok(res.requestId);
				assert.ok(res.reservationSet);
				
				done();
			});
		});
	});
	
});
