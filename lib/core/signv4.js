'use strict';

var ring = require('ring');

var crypto = require('crypto');

var tools = require('./tools.js');
var SignV2 = require('./signv2.js');

module.exports = ring.create(SignV2, {

	// Task 1: Create a Canonical Request For Signature Version 4

	sha256: function(payload) {
		var sha256 = crypto.createHash('sha256');
		sha256.update(payload);
		return sha256.digest('hex');
	},

	canonicalHeaders: function(headers) {
		headers = tools.sortObject(headers);

		var idx, canonicalHeaders = [];
		for (idx in headers) {
			if (headers.hasOwnProperty(idx)) {
				canonicalHeaders.push(idx.toLowerCase() + ':' + String(headers[idx]).trim());
			}
		}

		return canonicalHeaders.join('\n') + '\n';
	},

	signedHeaders: function(headers) {
		headers = tools.sortObject(headers);

		var idx, signedHeaders = [];
		for (idx in headers) {
			if (headers.hasOwnProperty(idx)) {
				signedHeaders.push(idx.toLowerCase());
			}
		}
		return signedHeaders.join(';');
	},

	requestPayload: function(body) {
		if (body) {
			return this.sha256(body);
		}

		return '';
	},

	hashedCanonicalRequest: function(headers, body) {
		var canonicalRequest = [
			'POST',
			this.getPath(),
			'',
			this.canonicalHeaders(headers),
			this.signedHeaders(headers),
			this.requestPayload(body)
		].join('\n');
		return this.sha256(canonicalRequest);
	},

	// Task 2: Create a String to Sign for Signature Version 4

	date: function(timestamp) {
		return String(timestamp.getUTCFullYear()) + tools.padInt(timestamp.getUTCMonth() + 1, 2) + tools.padInt(timestamp.getUTCDate(), 2);
	},

	iso8601Basic: function(date, timestamp) {
		return date + 'T' + tools.padInt(timestamp.getUTCHours(), 2) + tools.padInt(timestamp.getUTCMinutes(), 2) + tools.padInt(timestamp.getUTCSeconds(), 2) + 'Z';
	},

	credentialScope: function(date) {
		return date + '/' + this.getRegion() + '/' + this.getPrefix() + '/aws4_request';
	},

	stringToSign: function(credentialScope, headers, body, date, timestamp) {
		return ['AWS4-HMAC-SHA256',
			this.iso8601Basic(date, timestamp),
			credentialScope,
			this.hashedCanonicalRequest(headers, body)
		].join('\n');
	},

	// Task 3: Calculate the AWS Signature Version 4

	signingKey: function(date) {
		var kDate = this.createHmacSha256('AWS4' + this.getSecretAccessKey(), date);
		var kRegion = this.createHmacSha256(kDate, this.getRegion());
		var kService = this.createHmacSha256(kRegion, this.getPrefix());
		return this.createHmacSha256(kService, 'aws4_request');
	},

	signature: function (credentialScope, headers, body, date, timestamp) {
		return this.createHmacSha256(
			this.signingKey(date),
			this.stringToSign(credentialScope, headers, body, date, timestamp),
			'hex'
		);
	},
	
	// And finally, the sign method

	sign: function(headers, body) {
		var timestamp = new Date();
		var date = this.date(timestamp);
		var credentialScope = this.credentialScope(date);
		var signature = this.signature(credentialScope, headers, body, date, timestamp);

		return 'AWS4-HMAC-SHA256 Credential=' + this.getAccessKeyId() + '/' + credentialScope + ',SignedHeaders=' + this.signedHeaders(headers) + ',Signature=' + signature;
	}
});
