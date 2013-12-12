'use strict';

/* 3rd party module */
var ring = require('ring');

/* core module */
var qs = require('querystring');

/* internal modules */
var tools = require('./tools.js');
var conf = require('../../config/conf.js');

/* SignV3 inherits createHmacSha256 from SignV2*/
var SignV2 = require('./signv2.js');

module.exports = ring.create(SignV2, {
	sign: function(timestamp) {
		return 'AWS3-HTTPS AWSAccessKeyId=' + this.getAccessKeyId() + ',Algorithm=HmacSHA256,' + 'Signature=' + this.createHmacSha256(this.getSecretAccessKey(), timestamp, 'base64');
	},

	request: function(action, query, callback) {
		if (!callback) {
			callback = query;
			query = {};
		}

		query.Action = action;
		query.Version = this.getApiVersion();
		if (this.getSessionToken()) {
			query.SecurityToken = this.getSessionToken();
		}

		var timestamp = new Date().toUTCString();

		this.post(this.getPath(), {
			'user-agent': conf.userAgent,
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
			date: timestamp,
			'x-amzn-authorization': this.sign(timestamp)
		}, new Buffer(qs.stringify(query)), callback);
	}
});
