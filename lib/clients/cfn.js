'use strict';

var ring = require('ring');

var Query = require('../core/query.js');
var SignV4 = require('../core/signv4.js');
var Region = require('../core/region.js');

module.exports = ring.create([Query, SignV4, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		if (!region) {
			region = 'us-east-1';
		} else {
			this.isRegion(region);
		}

		this.setPrefix('cloudformation');

		this.$super({
			endPoint: this.getPrefix() + '.' + String(region) + '.amazonaws.com',
			accessKeyId: String(accessKeyId),
			secretAccessKey: String(secretAccessKey),
			apiVersion: this.getVersions().CFN
		});
	}

	// Next: Methods for wrapping Query.request('Action')
});
