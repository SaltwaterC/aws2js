'use strict';

var ring = require('ring');

var AWS = require('../core/aws.js');
var SignV2 = require('../core/signv2.js');
var Region = require('../core/region.js');

module.exports = ring.create([AWS, SignV2, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		this.setPrefix('ec2');
		this.setRegion(region);

		this.$super(
			this.getEndPoint(),
			accessKeyId,
			secretAccessKey,
			this.getVersions().EC2
		);
	}

	// Next: Methods for wrapping Query.request('Action')
});
