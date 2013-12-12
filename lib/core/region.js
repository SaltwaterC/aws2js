'use strict';

var ring = require('ring');

module.exports = ring.create({
	setRegion: function(region) {
		if (!region) {
			region = 'us-east-1';
		}
		region = this.isRegion(region);
		this.region = region;
		if (this.getPrefix()) {
			this.setEndPoint(this.getPrefix() + '.' + this.getRegion() + '.amazonaws.com');
		}
		return this;
	},

	isRegion: function(input) {
		input = String(input);
		if (input.match(/^\w+-\w+-\d+$/) === null) {
			throw new Error('The region name doesn\'t match the region pattern.');
		}
		return input;
	}
});
