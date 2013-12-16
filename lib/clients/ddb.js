'use strict';

/*global unescape*/

var ring = require('ring');
var http = require('http-request');

var AWS = require('../core/aws.js');
var SignV4 = require('../core/signv4.js');
var Region = require('../core/region.js');

var conf = require('../../config/conf.js');

module.exports = ring.create([AWS, SignV4, Region], {
	constructor: function(accessKeyId, secretAccessKey, sessionToken, region) {
		this.setPrefix('dynamodb');
		this.setRegion(region);

		if (!sessionToken) {
			throw new Error('The DynamoDB client requires a session token obtained from Security Token Service.');
		}
		this.setSessionToken(sessionToken);

		this.$super(
			this.getEndPoint(),
			accessKeyId,
			secretAccessKey,
			this.getVersions().DDB
		);

		this.squashApiVersion();
	},

	squashApiVersion: function() {
		this.squashedApiVersion = this.apiVersion.replace(/-/g, '');
		return this;
	},

	getSquashedApiVersion: function() {
		return this.squashedApiVersion;
	},

	// this needs to be overriden due to JSON request / response instead of
	// query arguments and XML response
	request: function(action, json, callback) {
		if (!callback) {
			callback = json;
			json = {};
		}

		var timestamp = new Date();
		var headers = {
			host: this.getEndPoint(),
			'content-type': 'application/x-amz-json-1.0;charset=utf-8',
			'x-amz-date': this.iso8601Basic(timestamp),
			'x-amz-target': 'DynamoDB_' + this.getSquashedApiVersion() + '.' + action,
			'x-amz-security-token': this.getSessionToken(),
			'user-agent': conf.userAgent
		};
		var body = JSON.stringify(json);
		body = unescape(body.replace(/\\u/g, '%u'));
		headers.authorization = this.sign(timestamp, headers, body);

		// TODO: add CRC32 check for the response, pass err if mismatch
		this.post(this.getPath(), headers, new Buffer(body, 'utf8'), 'json', callback);
	}

	// Next: Methods for wrapping Query.request('Action')
});
