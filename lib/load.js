'use strict';

// add the submodules here
exports.EC2 = require('./clients/ec2.js'); // Elastic Compute Cloud
exports.RDS = require('./clients/rds.js'); // Relational Database Service
exports.SES = require('./clients/ses.js'); // Simple Email Service
exports.ELB = require('./clients/elb.js'); // Elastic Load Balancing
exports.IAM = require('./clients/iam.js'); // Identity and Access Management
exports.AS = require('./clients/as.js'); // Auto Scaling
exports.CW = require('./clients/cw.js'); // CloudWatch
exports.EC = require('./clients/ec.js'); // ElastiCache
exports.SQS = require('./clients/sqs.js'); // Simple Queue Service
exports.CFN = require('./clients/cfn.js'); // CloudFormation
exports.SDB = require('./clients/sdb.js'); // SimpleDB
exports.STS = require('./clients/sts.js'); // Security Token Service
exports.DDB = require('./clients/ddb.js'); // DynamoDB
exports.SNS = require('./clients/sns.js'); // Simple Notification Service

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
