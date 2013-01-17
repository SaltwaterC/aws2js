'use strict';

var common = require('./includes/common.js');

var assert = require('assert');
var elasticache = require('../').load('elasticache');

elasticache.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

try {
	elasticache.setRegion('us-east-1');
} catch (e) {
	assert.ok(e instanceof Error);
}

var callbacks = {
	request: 0,
	requestWithoutQuery: 0
};

var elasticacheProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.DescribeCacheClustersResult.CacheClusters);
};

elasticache.request('DescribeCacheClusters', {}, function (err, res) {
	callbacks.request++;
	elasticacheProcessResponse(err, res);
});

elasticache.request('DescribeCacheClusters', function (err, res) {
	callbacks.requestWithoutQuery++;
	elasticacheProcessResponse(err, res);
});

common.teardown(callbacks);
