'use strict';

var util = require('util');
var ring = require('ring');

var Query = require('../core/query.js');
var Region = require('../core/region.js');

module.exports = ring.create([Query, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		if (!region) {
			region = 'us-east-1';
		} else {
			this.isRegion(region);
		}

		this.prefix = 'sqs';

		this.$super({
			endPoint: this.prefix + '.' + String(region) + '.amazonaws.com',
			accessKeyId: String(accessKeyId),
			secretAccessKey: String(secretAccessKey),
			apiVersion: this.getVersions().SQS
		});
	},

	setQueue: function(queue) {
		queue = String(queue);
		/*jslint regexp:true*/
		if (queue.match(/\/[0-9]{12}\/.*\//)) {
			/*jslint regexp:false*/
			this.path = queue;
			return this;
		}

		throw new Error(util.format('Invalid queue path: %s', queue));
	}

	// Next: Methods for wrapping Query.request('Action')
});
