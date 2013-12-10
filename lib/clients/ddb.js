'use strict';

/*global unescape*/

var ring = require('ring');
var http = require('http-request');

var Query = require('../core/query.js');
var SignV4 = require('../core/signv4.js');
var Region = require('../core/region.js');

var conf = require('../../config/conf.js');

module.exports = ring.create([Query, SignV4, Region], {
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
			'content-type': 'application/x-amz-json-1.0',
			'x-amz-date': this.iso8601Basic(timestamp),
			'x-amz-target': 'DynamoDB_' + this.getSquashedApiVersion() + '.' + action,
			'x-amz-security-token': this.getSessionToken(),
			'user-agent': conf.userAgent
		};
		var body = JSON.stringify(json);
		body = unescape(body.replace(/\\u/g, '%u'));

		headers.authorization = this.sign(timestamp, headers, body);

		this.post({
			url: 'https://' + this.getEndPoint() + this.getPath(),
			headers: headers,
			reqBody: body
		}, callback);
	},

	post: function(options, callback) {
		http.post(options, function(error, response) {
			// XXX add CRC32 check for the response, pass err if mismatch
			if (error) {
				try {
					error.document = JSON.parse(error.document);
				} catch (err) {
					error.json = err;
				}

				callback(error);
				return;
			}

			try {
				callback(null, JSON.parse(response.buffer.toString()));
			} catch (err) {
				callback(err);
			}
		});
	}

	// Next: Methods for wrapping Query.request('Action')
});
