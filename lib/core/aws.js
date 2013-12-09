'use strict';

/* 3rd party module */
var ring = require('ring');

/* internal module */
var tools = require('./tools.js');

module.exports = ring.create({
	constructor: function(endPoint, accessKeyId, secretAccessKey) {
		this.setEndPoint(endPoint);
		this.setCredentials(accessKeyId, secretAccessKey);
		this.getVersions();
		this.setPath('/');
		this.region = 'us-east-1';
	},

	setPath: function(path) {
		this.path = String(path);
		return this;
	},

	getPath: function() {
		return this.path;
	},

	getRegion: function() {
		return this.region;
	},

	setPrefix: function(prefix) {
		this.prefix = String(prefix);
		return this;
	},

	getPrefix: function() {
		return this.prefix;
	},

	getVersions: function() {
		this.versions = require('../../config/versions.json');
		return this.versions;
	},

	setEndPoint: function(endPoint) {
		this.endPoint = String(endPoint);
		return this;
	},

	getEndPoint: function() {
		return this.endPoint;
	},

	setCredentials: function(accessKeyId, secretAccessKey, sessionToken) {
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

		if (sessionToken) {
			console.error('Warning: passing the STS session token to setCredentials is deprecated. Use setSessionToken instead.');
			this.setSessionToken(sessionToken);
		}

		return this;
	},

	getAccessKeyId: function() {
		return this.accessKeyId;
	},

	getSecretAccessKey: function() {
		return this.secretAccessKey;
	},

	setSessionToken: function(sessionToken) {
		this.sessionToken = String(sessionToken);
		return this;
	},

	getSessionToken: function() {
		return this.sessionToken;
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
