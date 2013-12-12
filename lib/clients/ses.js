'use strict';

var ring = require('ring');

var AWS = require('../core/aws.js');
var SignV3 = require('../core/signv3.js');

module.exports = ring.create([AWS, SignV3], {
	constructor: function(accessKeyId, secretAccessKey) {
		this.$super(
			'email.us-east-1.amazonaws.com',
			accessKeyId,
			secretAccessKey,
			this.getVersions().SES
		);
	}

	// Next: Methods for wrapping Query.request('Action')
});
