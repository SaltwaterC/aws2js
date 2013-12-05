'use strict';

var qs = require('querystring');
var ring = require('ring');

var conf = require('../../config/conf.js');
var Query = require('../core/query.js');

module.exports = ring.create(Query, {
	constructor: function(accessKeyId, secretAccessKey) {
		this.$super({
			endPoint: 'email.us-east-1.amazonaws.com',
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
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

		var date = new Date().toUTCString();

		this.post({
			url: 'https://' + this.endPoint + this.path,
			headers: {
				'user-agent': conf.userAgent,
				'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
				date: date,
				'x-amzn-authorization': 'AWS3-HTTPS AWSAccessKeyId=' + this.accessKeyId + ', Algorithm=HmacSHA256,' + 'Signature=' + this.createHmac(date)
			},
			reqBody: new Buffer(qs.stringify(query))
		}, callback);
	}

	// Next: Methods for wrapping Query.request('Action')
});
