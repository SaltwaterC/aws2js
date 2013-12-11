'use strict';

var ring = require('ring');

var REST = require('../core/rest.js');
var SignS3 = require('../core/signs3.js');
var Region = require('../core/region.js');

var tools = require('../core/tools.js');

module.exports = ring.create([REST, SignS3, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		this.setPrefix('s3');
		this.$super(
			this.getPrefix() + '.amazonaws.com',
			accessKeyId,
			secretAccessKey
		);

		if (!region) {
			region = 'us-east-1';
		}
		this.setRegion(region);

		// this was not changed since 2006, but adding it for consistency's sake
		this.setApiVersion(this.getVersions().S3);
	},

	setRegion: function(region) {
		region = String(region);
		this.isRegion(region);

		this.region = region;

		if (region === 'us-east-1') {
			this.setEndPoint(this.getPrefix() + '.amazonaws.com');
		} else {
			this.setEndPoint(this.getPrefix() + '-' + this.getRegion() + '.amazonaws.com');
		}

		return this;
	},

	setBucket: function(bucket) {
		this.bucket = bucket;
		return this;
	},

	getBucket: function() {
		return this.bucket;
	},

	signUrl: function(protocol, method, path, expires, headers) {
		protocol = String(protocol).toLowerCase();
		if (protocol !== 'http' && protocol !== 'https') {
			throw new Error('Invalid protocol argument. Expecting: http, or https.');
		}

		method = String(method).toUpperCase();
		if (method !== 'GET' && method !== 'HEAD' && method !== 'POST' && method !== 'PUT' && method !== 'DELETE') {
			throw new Error('Invalid method argument. Expecting: GET, HEAD, POST, PUT, or DELETE');
		}

		if (!(expires instanceof Date)) {
			throw new Error('Expecting a Date object for the expires argument.');
		}

		path = String(path);
		if (path.charAt(0) !== '/') {
			path = '/' + path;
		}
		path = encodeURI(path);

		if (!headers) {
			headers = {};
		}

		// normalize the header names
		headers = tools.lowerCaseKeysObject(headers);

		if (headers['x-amz-date']) {
			// make sure x-amz-date won't leak into the sign method
			delete(headers['x-amz-date']);
		}

		// signing URLs expects an expires value expressed in UNIX time instead of the date header
		headers.date = Math.floor(expires.getTime() / 1000);

		var signature = 'AWSAccessKeyId=' + this.getAccessKeyId() + '&Expires=' + headers.date + '&Signature=' + encodeURIComponent(this.sign(method, headers, path));

		var separator = '?';
		if (path.indexOf('?') !== -1) {
			separator = '&';
		}

		return protocol + '://' + this.endPoint + '/' + this.getBucket() + path + separator + signature;
	}
});
