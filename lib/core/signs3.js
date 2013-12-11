'use strict';

var crypto = require('crypto');

var ring = require('ring');

var tools = require('./tools.js');

module.exports = ring.create({
	createHmacSha1: function(string) {
		return crypto.createHmac('sha1', this.getSecretAccessKey()).update(string).digest('base64');
	},

	sign: function(method, headers, path) {
		var toSign = method + '\n';

		if (headers['content-md5']) {
			toSign += headers['content-md5'];
		}
		toSign += '\n';

		if (headers['content-type']) {
			toSign += headers['content-type'];
		}
		toSign += '\n';

		toSign += headers.date;
		toSign += '\n';

		var key, amzPrefix, type, xAmz = {};

		for (key in headers) {
			if (headers.hasOwnProperty(key)) {
				amzPrefix = key.substr(0, 5);
				if (amzPrefix === 'x-amz') {
					type = typeof headers[key];
					if (type === 'string' || type === 'number') {
						xAmz[key] = headers[key];
					} else {
						console.error('Warning: the header %s has the %s value with the type %s. This may have unintended side effects.', key, headers[key], type);
					}
				}
			}
		}

		xAmz = tools.sortObject(xAmz);

		for (key in xAmz) {
			if (xAmz.hasOwnProperty(key)) {
				toSign += key + ':' + String(xAmz[key]).trim() + '\n';
			}
		}

		toSign += '/' + this.getBucket() + path;

		return this.createHmacSha1(toSign);
	}
});
