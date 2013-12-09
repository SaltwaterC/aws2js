'use strict';

var qs = require('querystring');
var ring = require('ring');

var conf = require('../../config/conf.js');
var Query = require('../core/query.js');
var SignV3 = require('../core/signv3.js');

module.exports = ring.create([Query, SignV3], {
	constructor: function(accessKeyId, secretAccessKey) {
		this.$super({
			endPoint: 'email.us-east-1.amazonaws.com',
			accessKeyId: String(accessKeyId),
			secretAccessKey: String(secretAccessKey),
			apiVersion: this.getVersions().SES
		});
	},

	// This is different from the Query implementation since SES signs
	// the x-amzn-authorization instead of going with the usual argument signing
	request: function(action, query, callback) {
		if (!callback) {
			callback = query;
			query = {};
		}

		query.Action = action;

		var timestamp = new Date().toUTCString();

		this.post({
			url: 'https://' + this.getEndPoint() + this.getPath(),
			headers: {
				'user-agent': conf.userAgent,
				'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
				date: timestamp,
				'x-amzn-authorization': this.sign(timestamp)
			},
			reqBody: new Buffer(qs.stringify(query))
		}, callback);
	}

	// Next: Methods for wrapping Query.request('Action')
});
