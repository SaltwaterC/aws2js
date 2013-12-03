'use strict';

var ring = require('ring');

var tools = require('./tools.js');
var Query = require('./query.js');
var Region = require('./region.js');

var versions = require('../config/versions.json');

var EC2 = ring.create([Query, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		if (!region) {
			region = 'us-east-1';
		} else {
			region = tools.isRegion(region);
		}

		this.$super({
			endPoint: 'ec2.' + String(region) + '.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			apiVersion: versions.EC2
		});

		this.prefix = 'ec2';
	}
	
	// Next: Methods for wrapping Query.request('Action')
});

module.exports = EC2;
