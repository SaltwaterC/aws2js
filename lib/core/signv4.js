'use strict';

var ring = require('ring');

var crypto = require('crypto');

var tools = require('./tools.js');
var SignV2 = require('./signv2.js');

module.exports = ring.create(SignV2, {
	month: function(timestamp) {
		return tools.padInt(timestamp.getMonth() + 1, 1);
	},

	date: function(timestamp) {
		return tools.padInt(timestamp.getDate());
	},

	iso8601Basic: function(date, timestamp) {
		return date + 'T' + tools.padInt(timestamp.getHours(), 1) + tools.padInt(timestamp.getMinutes(), 1) + tools.padInt(timestamp.getSeconds(), 1) + 'Z';
	},

	signingKey: function(date) {
		var kDate = this.createHmacSha256('AWS4' + this.getSecretAccessKey(), date, 'binary');
		var kRegion = this.createHmacSha256(kDate, this.getRegion(), 'binary');
		var kService = this.createHmacSha256(kRegion, this.getPrefix(), 'binary');
		return this.createHmacSha256(kService, 'aws4_request', 'binary');
	},

	canonicalHeaders: function(headers) {
		var idx, canonicalHeaders = [];
		for (idx in headers) {
			if (headers.hasOwnProperty(idx)) {
				canonicalHeaders.push(idx + ':' + String(headers[idx]).trim());
			}
		}

		return canonicalHeaders.join('\n');
	},

	sha256: function(payload) {
		var sha256 = crypto.createHash('sha256');
		sha256.update(payload);
		return sha256.digest('hex');
	},

	hashedCanonicalRequest: function(headers, body) {
		return this.sha256([
			'POST',
			this.getPath(),
			'',
			this.canonicalHeaders(headers),
			'',
			this.signedHeaders(headers),
			this.requestPayload(body)
		].join('\n'));
	},

	requestPayload: function(body) {
		if (body) {
			return this.sha256(body);
		}

		return '';
	},

	signedHeaders: function(headers) {
		var idx, signedHeaders = [];
		for (idx in headers) {
			if (headers.hasOwnProperty(idx)) {
				signedHeaders.push(idx);
			}
		}
		return signedHeaders.join(',');
	},

	sign: function(headers, body) {
		headers = tools.sortObject(headers);

		var timestamp = new Date();

		var date = String(timestamp.getFullYear) + this.date(timestamp) + this.month(timestamp);
		var credentialScope = '/' + this.getRegion() + '/' + this.getPrefix() + '/aws4_request';

		var toSign = ['AWS4-HMAC-SHA256',
			this.iso8601Basic(),
			credentialScope,
			this.hashedCanonicalRequest(headers, body)
		].join('\n');

		var signature = this.createHmacSha256(this.signingKey(date), toSign, 'hex');

		return 'AWS4-HMAC-SHA256 Credential=' + this.getAccessKeyId() + '/' + date + credentialScope + ',SignedHeaders=' + this.signedHeaders(headers) + ',Signature=' + signature;
	}
});
