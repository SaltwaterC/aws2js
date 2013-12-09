'use strict';

var ring = require('ring');

var tools = require('./tools.js');
var SignV2 = require('./signv2.js');

module.exports = ring.create(SignV2, {
	sign: function(timestamp) {
		return 'AWS3-HTTPS AWSAccessKeyId=' + this.getAccessKeyId() + ',Algorithm=HmacSHA256,' + 'Signature=' + this.createHmacSha256(this.getSecretAccessKey(), timestamp);
	}
});
