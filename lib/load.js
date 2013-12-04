'use strict';

// add the submodules here
exports.EC2 = require('./ec2.js'); // Elastic Compute Cloud
exports.RDS = require('./rds.js'); // Relational Database Service
exports.SES = require('./ses.js'); // Simple Email Service
exports.ELB = require('./elb.js'); // Elastic Load Balancing
exports.IAM = require('./iam.js'); // Identity and Access Management
exports.AS = require('./as.js'); // Auto Scaling
exports.CW = require('./cw.js'); // CloudWatch

/*jslint todo:true*/ // XXX

// map the legacy service names
var map = require('../config/map.json');

exports.load = function(service, accessKeyId, secretAccessKey, sessionToken, httpOptions) {
	// TODO: implement httpOptions support in http-request and aws.js
	console.error('Warning: the library loader of aws2js is deprecated. Use the exported constructors for each service instead. See the examples from README.md.');

	if (exports[map[service]]) {
		var svc = new exports[map[service]](accessKeyId, secretAccessKey);

		if (sessionToken) {
			svc.setSessionToken(sessionToken);
		}

		if (httpOptions) {
			svc.setHttpOptions(httpOptions);
		}

		return svc;
	}

	throw new Error('Invalid AWS client.');
};
