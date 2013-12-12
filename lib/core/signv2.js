'use strict';

/* 3rd party module */
var ring = require('ring');

/* core modules */
var qs = require('querystring');
var crypto = require('crypto');

/* internal modules */
var tools = require('./tools.js');
var conf = require('../../config/conf.js');

var REST = require('./rest.js');

module.exports = ring.create(REST, {
	createHmacSha256: function(key, string, format) {
		if (!format) {
			// due to lack of Buffer output from the digest method in node.js v0.8.x
			// I've to use this monstrosity
			return new Buffer(crypto.createHmac('sha256', key).update(string).digest('binary'), 'binary');
		}

		return crypto.createHmac('sha256', key).update(string).digest(format);
	},

	sign: function(query) {
		var toSign = [
			'POST',
			this.getEndPoint(),
			this.getPath(),
			qs.stringify(tools.sortObject(query))
		].join('\n');

		toSign = toSign.replace(/!/g, '%21');
		toSign = toSign.replace(/'/g, '%27');
		toSign = toSign.replace(/\*/g, '%2A');
		toSign = toSign.replace(/\(/g, '%28');
		toSign = toSign.replace(/\)/g, '%29');

		return this.createHmacSha256(this.getSecretAccessKey(), toSign, 'base64');
	},

	request: function(action, query, callback) {
		if (!callback) {
			callback = query;
			query = {};
		}

		query.AWSAccessKeyId = this.accessKeyId;
		query.Version = this.apiVersion;

		query.Action = String(action);
		query.SignatureMethod = 'HmacSHA256';
		query.SignatureVersion = '2';
		query.Timestamp = new Date().toISOString();

		if (this.getSessionToken()) {
			query.SecurityToken = this.getSessionToken();
		}

		query.Signature = this.sign(query);

		this.post(this.getPath(), {
			'user-agent': conf.userAgent,
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		}, new Buffer(qs.stringify(query)), callback);
	}
});
