var pack = require('../package.json');

module.exports = {
	userAgent: require('util').format('aws2js/v%s (http://git.io/pWVe0g) node.js/%s', pack.version, process.version)
};
