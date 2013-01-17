'use strict';

var common = require('./includes/common.js');

var assert = require('assert');

var sdbEast = require('../').load('sdb');
var sdbWest = require('../').load('sdb');

sdbEast.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
sdbEast.setRegion('us-east-1');

sdbWest.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
sdbWest.setRegion('us-west-1');

var callbacks = {
	requestEast: 0,
	requestEastWithoutQuery: 0,
	requestEastWithQuery: 0,
	requestWest: 0,
	requestWestWithoutQuery: 0,
	requestWestWithQuery: 0
};

var sdbProcessResponse = function (err, res) {
	assert.ifError(err);
	assert.ok(res.ListDomainsResult);
};

sdbEast.request('ListDomains', {}, function (err, res) {
	callbacks.requestEast++;
	sdbProcessResponse(err, res);
});

sdbEast.request('ListDomains', function (err, res) {
	callbacks.requestEastWithoutQuery++;
	sdbProcessResponse(err, res);
});

sdbEast.request('ListDomains', {MaxNumberOfDomains: 10}, function (err, res) {
	callbacks.requestEastWithQuery++;
	sdbProcessResponse(err, res);
});

sdbWest.request('ListDomains', {}, function (err, res) {
	callbacks.requestWest++;
	sdbProcessResponse(err, res);
});

sdbWest.request('ListDomains', function (err, res) {
	callbacks.requestWestWithoutQuery++;
	sdbProcessResponse(err, res);
});

sdbWest.request('ListDomains', {MaxNumberOfDomains: 10}, function (err, res) {
	callbacks.requestWestWithQuery++;
	sdbProcessResponse(err, res);
});

common.teardown(callbacks);
