'use strict';

var ring = require('ring');

var Region = ring.create({
	setRegion: function(region) {
		region = String(region);
		this.isRegion(region);

		this.region = region;

		if (this.prefix) {
			this.setEndPoint(this.prefix + '.' + this.region + '.amazonaws.com');
		}
	},

	isRegion: function(input) {
		if (String(input).match(/\w+-\w+-\d+/) === null) {
			throw new Error('The region name doesn\'t match the region pattern.');
		}
	}
});

module.exports = Region;
