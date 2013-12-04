'use strict';

var ring = require('ring');

var Query = require('../core/query.js');

module.exports = ring.create(Query, {
	constructor: function(accessKeyId, secretAccessKey) {
		this.$super({
			endPoint: 'iam.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			apiVersion: this.getVersions().IAM
		});
	}

	// Next: Methods for wrapping Query.request('Action')
});
