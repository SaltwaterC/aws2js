'use strict';

var common = require('./includes/common.js');

var assert = require('assert');

var aws = require('../');
var dynamodb = aws.load('dynamodb');
var sts = aws.load('sts', process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

try {
	dynamodb.setRegion('us-east-1');
} catch (e) {
	assert.ok(e instanceof Error);
}

var callbacks = {
	request: 0,
	requestWithoutBody: 0
};

sts.request('GetSessionToken', function (err, res) {
	assert.ifError(err);
	
	var credentials = res.GetSessionTokenResult.Credentials;
	dynamodb.setCredentials(credentials.AccessKeyId, credentials.SecretAccessKey, credentials.SessionToken);
	
	dynamodb.request('ListTables', function (err, res) {
		callbacks.requestWithoutBody++;
		assert.ifError(err);
		assert.ok(res.TableNames);
	});
	
	dynamodb.request('ListTables', {}, function (err, res) {
		callbacks.request++;
		assert.ifError(err);
		assert.ok(res.TableNames);
	});
});

common.teardown(callbacks);
