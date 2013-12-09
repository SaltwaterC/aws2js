'use strict';

var ring = require('ring');

var Query = require('../core/query.js');
var SignV2 = require('../core/signv2.js');

module.exports = ring.create([Query, SignV2], {
	constructor: function(accessKeyId, secretAccessKey) {
		this.$super({
			endPoint: 'sts.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			apiVersion: this.getVersions().STS
		});
	}

	// Next: Methods for wrapping Query.request('Action')
});
