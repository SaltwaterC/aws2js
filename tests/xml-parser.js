'use strict';

var common = require('./includes/common.js');

var fs = require('fs');
var assert = require('assert');

var config = require('../config/aws.js');
var dependencies = require('../config/dependencies.js');

var xmlDep = require(dependencies.xml);
var mimeDep = require(dependencies.mime);

var callbacks = {
	parser: 0
};

var parser;
if (dependencies.xml === 'libxml-to-js') {
	parser = xmlDep;
} else { // xml2js
	parser = new xmlDep.Parser(config.xml2jsConfig).parseString;
}

fs.readFile('data/ec2-describeimages.xml', function (err, data) {
	assert.ifError(err);
	
	var xml = new Buffer(data).toString();
	parser(xml, function (err, res) {
		callbacks.parser++;
		assert.ifError(err);
		assert.equal(res.imagesSet.item[0].imageId, 'ami-be3adfd7');
		assert.equal(res.imagesSet.item[1].imageId, 'ami-be3adfd9');
	});
});

common.teardown(callbacks);
