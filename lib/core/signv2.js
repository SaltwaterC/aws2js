'use strict';

var ring = require('ring');

var qs = require('querystring');
var crypto = require('crypto');

var tools = require('./tools.js');

module.exports = ring.create({
	createHmacSha256: function(key, string, format) {
		if (!format) {
			format = 'base64';
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

		return this.createHmacSha256(this.getSecretAccessKey(), toSign);
	}
});
