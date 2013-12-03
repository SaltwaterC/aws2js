'use strict';

var ring = require('ring');

var tools = require('./tools.js');
var Query = require('./query.js');
var Region = require('./region.js');

var versions = require('../config/versions.json');

var RDS = ring.create([Query, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		if (!region) {
			region = 'us-east-1';
		} else {
			this.isRegion(region);
		}

		this.$super({
			endPoint: 'rds.' + String(region) + '.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			apiVersion: versions.RDS
		});

		this.prefix = 'rds';
	}

	// Next: Methods for wrapping Query.request('Action')
});

module.exports = RDS;
