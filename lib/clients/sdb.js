'use strict';

var ring = require('ring');

var Query = require('../core/query.js');
var Region = require('../core/region.js');

module.exports = ring.create([Query, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		var endPoint;
		this.prefix = 'sdb';
		
		if (!region || region === 'us-east-1') {
			endPoint = 'sdb.amazonaws.com';
		} else {
			this.isRegion(region);
			endPoint = this.prefix + '.' + String(region) + '.amazonaws.com';
		}

		this.$super({
			endPoint: endPoint,
			accessKeyId: String(accessKeyId),
			secretAccessKey: String(secretAccessKey),
			apiVersion: this.getVersions().SDB
		});
	},
	
	setRegion: function (region) {
		if (region === 'us-east-1') {
			this.setEndPoint('sdb.amazonaws.com');
		} else {
			this.$super(region);
		}
	}

	// Next: Methods for wrapping Query.request('Action')
});
