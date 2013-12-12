'use strict';

var ring = require('ring');

var AWS = require('../core/aws.js');
var SignV2 = require('../core/signv2.js');
var Region = require('../core/region.js');

module.exports = ring.create([AWS, SignV2, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		this.setPrefix('sdb');
		this.setRegion(region);

		this.$super(
			this.getEndPoint(),
			accessKeyId,
			secretAccessKey,
			this.getVersions().SDB
		);
	},

	setRegion: function(region) {
		if (!region) {
			region = 'us-east-1';
		}
		if (region === 'us-east-1') {
			this.setEndPoint('sdb.amazonaws.com');
		} else {
			this.$super(region);
		}

		return this;
	}

	// Next: Methods for wrapping Query.request('Action')
});
