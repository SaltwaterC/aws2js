'use strict';

// this file contains dynamic configuration options
// the static configuration is in json files

var util = require('util');

var pack = require('../package.json');

module.exports = {
	userAgent: util.format('aws2js/v%s (http://git.io/pWVe0g) node.js/%s', pack.version, process.version)
};
