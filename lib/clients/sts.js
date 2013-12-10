'use strict';

var ring = require('ring');

var Query = require('../core/query.js');
var SignV4 = require('../core/signv4.js');

module.exports = ring.create([Query, SignV4], {
	constructor: function(accessKeyId, secretAccessKey) {
		this.setPrefix('sts');

		this.$super({
			endPoint: this.getPrefix() + '.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			apiVersion: this.getVersions().STS
		});
	}

	// Next: Methods for wrapping Query.request('Action')
});
