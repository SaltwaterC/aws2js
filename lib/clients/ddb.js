'use strict';

var ring = require('ring');

var Query = require('../core/query.js');
var Region = require('../core/region.js');

module.exports = ring.create([Query, Region], {
	constructor: function(accessKeyId, secretAccessKey, sessionToken, region) {
		if (!region) {
			region = 'us-east-1';
		} else {
			this.isRegion(region);
		}

		if (!sessionToken) {
			throw new Error('The DynamoDB client requires a session token obtained from Security Token Service.');
		}

		this.setSessionToken(sessionToken);
		this.setPrefix('dynamodb');

		this.$super({
			endPoint: this.getPrefix() + '.' + String(region) + '.amazonaws.com',
			accessKeyId: String(accessKeyId),
			secretAccessKey: String(secretAccessKey),
			apiVersion: this.getVersions().DDB
		});

		this.squashApiVersion();
	},

	squashApiVersion: function() {
		this.squashedApiVersion = this.apiVersion.replace(/-/g, '');
		return this;
	},

	request: function(action, json, callback) {
		// XXX: implement this for DDB
		var timestamp = new Date().toUTCString();

		var headers = {
			host: this.getEndPoint(),
			date: timestamp,
			'content-type': 'application/x-amz-json-1.0',
			'x-amz-target': 'DynamoDB_' + this.squashedApiVersion + '.' + action,
			'x-amz-security-token': this.getSessionToken(),
			foo: action + json + callback
		};

		console.log(headers);

		// 'x-amzn-authorization': prefix + ' AWSAccessKeyId=' + config.accessKeyId + ', Algorithm=HmacSHA256,' + 'Signature=' + signature

	}

	// Next: Methods for wrapping Query.request('Action')
});
