'use strict';

var ring = require('ring');

var Query = require('../core/query.js');
var Region = require('../core/region.js');

module.exports = ring.create([Query, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		if (!region) {
			region = 'us-east-1';
		} else {
			this.isRegion(region);
		}

		this.prefix = 'ec2';

		this.$super({
			endPoint: this.prefix + '.' + String(region) + '.amazonaws.com',
			accessKeyId: String(accessKeyId),
			secretAccessKey: String(secretAccessKey),
			apiVersion: this.getVersions().EC2
		});
	}

	// Next: Methods for wrapping Query.request('Action')
});