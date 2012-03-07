var assert = require('assert');

var sdb = require('../').load('sdb');

sdb.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
sdb.setRegion('us-west-1');

var callbacks = {
	request: false,
	requestWithoutQuery: false,
	requestWithQuery: false
};

var sdbProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.ListDomainsResult);
};

sdb.request('ListDomains', {}, function (err, res) {
	callbacks.request = true;
	sdbProcessResponse(err, res);
});

sdb.request('ListDomains', function (err, res) {
	callbacks.requestWithoutQuery = true;
	sdbProcessResponse(err, res);
});

sdb.request('ListDomains', {MaxNumberOfDomains: 10}, function (err, res) {
	callbacks.requestWithQuery = true;
	sdbProcessResponse(err, res);
});

process.on('exit', function () {
	for (var i in callbacks) {
		assert.ok(callbacks[i]);
	}
});
