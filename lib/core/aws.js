'use strict';

/* 3rd party module */
var ring = require('ring');

/* internal module */
var tools = require('./tools.js');

var AWS = ring.create({
	constructor: function(endPoint, accessKeyId, secretAccessKey) {
		this.setEndPoint(endPoint);
		this.setCredentials(accessKeyId, secretAccessKey);
		this.getVersions();
	},

	getVersions: function() {
		this.versions = require('../../config/versions.json');
		return this.versions;
	},

	setEndPoint: function(endPoint) {
		this.endPoint = String(endPoint);
		return this;
	},

	setCredentials: function(accessKeyId, secretAccessKey) {
		accessKeyId = String(accessKeyId);
		secretAccessKey = String(secretAccessKey);

		// XXX validate the credentials if a proper pattern is identified
		// eg. always starts with AKIA
		if (accessKeyId.length !== 20) {
			throw new Error('The accessKeyId is expected to have a length of 20.');
		}

		if (secretAccessKey.length !== 40) {
			throw new Error('The secretAccessKey is expected to have a length of 40.');
		}

		this.accessKeyId = accessKeyId;
		this.secretAccessKey = secretAccessKey;
	},

	getEndPoint: function() {
		return this.endPoint;
	},

	setMaxSockets: function(value) {
		value = tools.absInt(value);
		if (value === 0) {
			value = 5;
		}
		require('http').Agent.defaultMaxSockets = value;
		return this;
	}
});

module.exports = AWS;
