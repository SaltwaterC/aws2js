'use strict';

var ring = require('ring');

var AWS = require('../core/aws.js');
var SignV4 = require('../core/signv4.js');

module.exports = ring.create([AWS, SignV4], {
	constructor: function(accessKeyId, secretAccessKey) {
		// clients without Region require a prefix for SignV4
		this.setPrefix('sts');
		this.$super(
			this.getPrefix() + '.amazonaws.com',
			accessKeyId,
			secretAccessKey,
			this.getVersions().STS
		);
	}

	// Next: Methods for wrapping Query.request('Action')
});
