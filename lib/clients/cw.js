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

		this.$super({
			endPoint: 'monitoring.' + String(region) + '.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			apiVersion: this.getVersions().CW
		});

		this.prefix = 'monitoring';
	}

	// Next: Methods for wrapping Query.request('Action')
});
