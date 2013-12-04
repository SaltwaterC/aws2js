'use strict';

var ring = require('ring');

var Query = require('./query.js');
var Region = require('./region.js');

var versions = require('../config/versions.json');

var ELB = ring.create([Query, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		if (!region) {
			region = 'us-east-1';
		} else {
			this.isRegion(region);
		}

		this.$super({
			endPoint: 'elasticloadbalancing.' + String(region) + '.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			apiVersion: versions.ELB
		});

		this.prefix = 'elasticloadbalancing';
	}

	// Next: Methods for wrapping Query.request('Action')
});

module.exports = ELB;
