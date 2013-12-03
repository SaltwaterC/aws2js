'use strict';

var ring = require('ring');

var Region = ring.create({
	setRegion: function(region) {
		region = String(region);

		if (region.match(/\w+-\w+-\d+/) === null) {
			throw new Error('The region name doesn\'t match the region pattern.');
		}

		this.region = region;
		
		if (this.prefix) {
			this.setEndPoint(this.prefix + '.' + this.region + '.amazonaws.com');
		}
	}
});

module.exports = Region;
