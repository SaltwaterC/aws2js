'use strict';

var ring = require('ring');

var Query = require('./query.js');
var Region = require('./region.js');

var versions = require('../config/versions.json');

var CW = ring.create([Query, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		if (!region) {
			region = 'us-east-1';
		} else {
			this.isRegion(region);
		}

		this.$super({
			endPoint: 'monitoring.' + String(region) + '.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			apiVersion: versions.CW
		});

		this.prefix = 'monitoring';
	}

	// Next: Methods for wrapping Query.request('Action')
});

module.exports = CW;
