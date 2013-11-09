'use strict';

var tools = require('./tools.js');

function AWS(endPoint, accessKeyId, secretAccessKey) {
	this.setEndPoint(endPoint);
	this.setCredentials(accessKeyId, secretAccessKey);
}

AWS.prototype.setCredentials = function (accessKeyId, secretAccessKey) {
	accessKeyId = String(accessKeyId);
	secretAccessKey = String(secretAccessKey);

	// XXX validate the credentials if a proper pattern is identified
	if (accessKeyId.length !== 20) {
		throw new Error('The accessKeyId is expected to have a length of 20.');
	}

	if (secretAccessKey.length !== 40) {
		throw new Error('The secretAccessKey is expected to have a length of 40.');
	}
	
	this.accessKeyId = accessKeyId;
	this.secretAccessKey = secretAccessKey;
};

AWS.prototype.setMaxSockets = function(value) {
	value = tools.absInt(value);
	if (value === 0) {
		value = 5;
	}
	require('http').Agent.defaultMaxSockets = value;
	return this;
};

AWS.prototype.getEndPoint = function() {
	return this.endPoint;
};

AWS.prototype.setEndPoint = function(endPoint) {
	this.endPoint = String(endPoint);
	return this;
};

module.exports = AWS;
