var assert = require('assert');

var sns = require('../').load('sns');

sns.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
sns.setRegion('us-east-1');

var callbacks = {
	request: false,
	requestWithoutQuery: false
};

var snsProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.ListSubscriptionsResult.Subscriptions);
};

sns.request('ListSubscriptions', {}, function (err, res) {
	callbacks.request = true;
	snsProcessResponse(err, res);
});

sns.request('ListSubscriptions', function (err, res) {
	callbacks.requestWithoutQuery = true;
	snsProcessResponse(err, res);
});

process.on('exit', function () {
	for (var i in callbacks) {
		assert.ok(callbacks[i]);
	}
});
