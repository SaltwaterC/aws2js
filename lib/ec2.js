'use strict';

var Query = require('./query.js');
var versions = require('../config/versions.json');

function EC2(accessKeyId, secretAccessKey, region) {
	if (!region) {
		// XXX validate the region
		region = 'us-east-1';
	}

	Query.call(this, {
		endPoint: 'ec2.' + region + '.amazonaws.com',
		accessKeyId: accessKeyId,
		secretAccessKey: secretAccessKey,
		apiVersion: versions.EC2
	});
}

require('util').inherits(EC2, Query);

// add EC2 methods here

module.exports = EC2;
