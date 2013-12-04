'use strict';

var ring = require('ring');

var Query = require('./query.js');

var versions = require('../config/versions.json');

var IAM = ring.create(Query, {
	constructor: function(accessKeyId, secretAccessKey) {
		this.$super({
			endPoint: 'iam.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			apiVersion: versions.IAM
		});
	}

	// Next: Methods for wrapping Query.request('Action')
});

module.exports = IAM;
