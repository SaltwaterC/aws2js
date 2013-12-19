'use strict';

var u = require('url');
var crypto = require('crypto');
var qs = require('querystring');

var ring = require('ring');

var tools = require('./tools.js');

var subResource = require('../../config/subresource.json');

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

		// strip the query parameters, except for the sub-resources
		var elements = u.parse(path);
		path = elements.pathname;
		path = path.replace('%27', '\'');
		var query = tools.sortObject(qs.parse(elements.query));
		if (!tools.isEmpty(query)) {
			var queryParts = [];
			for (key in query) {
				if (query.hasOwnProperty(key) && subResource[key] !== undefined) {
					if (query[key]) {
						queryParts.push(key + '=' + query[key]);
					} else {
						queryParts.push(key);
					}
				}
			}
			if (queryParts.length > 0) {
				path += '?' + queryParts.join('&');
			}
		}
		toSign += path;

		return this.createHmacSha1(toSign);
	}
});
