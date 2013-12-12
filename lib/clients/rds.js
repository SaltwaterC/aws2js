'use strict';

var ring = require('ring');

var AWS = require('../core/aws.js');
var SignV4 = require('../core/signv4.js');
var Region = require('../core/region.js');

module.exports = ring.create([AWS, SignV4, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		this.setPrefix('rds');
		this.setRegion(region);

		this.$super(
			this.getEndPoint(),
			accessKeyId,
			secretAccessKey,
			this.getVersions().RDS
		);
	}

	// Next: Methods for wrapping Query.request('Action')
});
