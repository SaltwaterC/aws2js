'use strict';

var common = require('./includes/common.js');

var fs = require('fs');
var util = require('util');
var assert = require('assert');

var config = require('../config/aws.js');

var have = {
	'libxml-to-js': true,
	'xml2js': true
};

var callbacks = {
	'libxml-to-js': 0,
	'xml2js': 0
};

try {
	require('libxml-to-js');
} catch (e) {
	have['libxml-to-js'] = false;
	callbacks['libxml-to-js']++;
	util.log('libxml-to-js is not installed, moving on without it');
}

try {
	require('xml2js');
} catch (e) {
	util.error('ERROR: xml2js is missing, can not test the installation');
	process.exit(1);
}

var testXml = function (lib) {
	util.log('testing the XML library ' + lib);
	
	var parser = require(lib);
	if (lib === 'xml2js') {
		parser = new parser.Parser(config.xml2jsConfig).parseString;
	}
	
	fs.readFile('data/ec2-describeimages.xml', function (err, data) {
		assert.ifError(err);
		
		var xml = new Buffer(data).toString();
		parser(xml, function (err, res) {
			callbacks[lib]++;
			assert.ifError(err);
			assert.equal(res.imagesSet.item[0].imageId, 'ami-be3adfd7');
			assert.equal(res.imagesSet.item[1].imageId, 'ami-be3adfd9');
		});
	});
};

var idx;
for (idx in have) {
	if (have.hasOwnProperty(idx) && have[idx] === true) {
		testXml(idx);
	}
}

common.teardown(callbacks);
