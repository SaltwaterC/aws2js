'use strict';

var util = require('util');
var ring = require('ring');

var AWS = require('../core/aws.js');
var SignV4 = require('../core/signv4.js');
var Region = require('../core/region.js');

module.exports = ring.create([AWS, SignV4, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		this.setPrefix('sqs');
		this.setRegion(region);

		this.$super(
			this.getEndPoint(),
			accessKeyId,
			secretAccessKey,
			this.getVersions().SQS
		);
	},

	setQueue: function(queue) {
		queue = String(queue);
		/*jslint regexp:true*/
		if (queue.match(/\/[0-9]{12}\/.*\//)) {
			/*jslint regexp:false*/
			this.setPath(queue);
			return this;
		}

		throw new Error(util.format('Invalid queue path: %s', queue));
	}

	// Next: Methods for wrapping Query.request('Action')
});
