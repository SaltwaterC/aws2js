#!/usr/bin/env node

// Checks the AWS docs for newer API versions

'use strict';

var fs = require('fs');

var http = require('http-request');
/*jshint camelcase:false*/
var beautify = require('js-beautify').js_beautify;
/*jshint camelcase:true*/

var tools = require('../lib/core/tools.js');

var docs = {
	EC2: 'http://docs.amazonwebservices.com/AWSEC2/latest/APIReference/Welcome.html',
	RDS: 'http://docs.amazonwebservices.com/AmazonRDS/latest/APIReference/Welcome.html',
	SES: 'http://docs.amazonwebservices.com/ses/latest/APIReference/Welcome.html',
	ELB: 'http://docs.amazonwebservices.com/ElasticLoadBalancing/latest/APIReference/Welcome.html',
	IAM: 'http://docs.amazonwebservices.com/IAM/latest/APIReference/Welcome.html',
	AS: 'http://docs.amazonwebservices.com/AutoScaling/latest/APIReference/Welcome.html',
	CW: 'http://docs.amazonwebservices.com/AmazonCloudWatch/latest/APIReference/Welcome.html',
	EC: 'http://docs.amazonwebservices.com/AmazonElastiCache/latest/APIReference/Welcome.html',
	SQS: 'http://docs.amazonwebservices.com/AWSSimpleQueueService/latest/APIReference/Welcome.html',
	CFN: 'http://docs.amazonwebservices.com/AWSCloudFormation/latest/APIReference/Welcome.html',
	SDB: 'http://docs.amazonwebservices.com/AmazonSimpleDB/latest/DeveloperGuide/Welcome.html',
	STS: 'http://docs.amazonwebservices.com/STS/latest/APIReference/Welcome.html',
	DDB: 'http://docs.amazonwebservices.com/amazondynamodb/latest/developerguide/Introduction.html',
	SNS: 'http://docs.amazonwebservices.com/sns/latest/api/Welcome.html',
	EMR: 'http://docs.amazonwebservices.com/ElasticMapReduce/latest/API/Welcome.html',
	S3: 'http://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html'
};

var idx, count = 0,
	results = {};

for (idx in docs) {
	if (docs.hasOwnProperty(idx)) {
		count++;
	}
}

var collectVersions = function(service, version) {
	console.log('Found version: %s for %s', version, service);
	results[service] = version;
	count--;
	if (count === 0) {
		results = tools.sortObject(results);

		/*jshint camelcase:false*/
		var beautified = beautify(JSON.stringify(results), {
			indent_with_tabs: true
		});
		/*jshint camelcase:true*/

		fs.writeFile(process.cwd() + '/config/versions.json', beautified, function(err) {
			if (err) {
				console.error(err);
				process.exit(1);
			}

			console.log('Saved the fetched versions to config/versions.json.');
		});
	}
};

var fetchVersion = function(service, url) {
	http.get(url, function(err, res) {
		if (err) {
			console.error('The %s service returned error: %s', service, err.message);
		} else {
			var version = res.buffer.toString().match(/API Version (\d{4}-\d{2}-\d{2})/);
			if (version && version[1]) {
				collectVersions(service, version[1]);
			} else {
				console.error('Did not find a version for: %s', service);
			}
		}
	});
};

var service;
for (service in docs) {
	if (docs.hasOwnProperty(service)) {
		fetchVersion(service, docs[service]);
	}
}
