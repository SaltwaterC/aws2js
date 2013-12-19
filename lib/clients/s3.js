'use strict';

var http = require('http-request');
var ring = require('ring');

var AWS = require('../core/aws.js');
var REST = require('../core/rest.js');
var SignS3 = require('../core/signs3.js');
var Region = require('../core/region.js');

var tools = require('../core/tools.js');

var acls = require('../../config/canned_acls.json');

module.exports = ring.create([AWS, REST, SignS3, Region], {
	constructor: function(accessKeyId, secretAccessKey, region) {
		this.setPrefix('s3');
		this.setRegion(region);
		this.setBucket('');

		this.$super(
			this.getEndPoint(),
			accessKeyId,
			secretAccessKey,
			// this was not changed since 2006, but adding it for consistency's sake
			this.getVersions().S3
		);
	},

	setRegion: function(region) {
		if (!region) {
			region = 'us-east-1';
		}
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
		this.bucket = String(bucket);
		return this;
	},

	getBucket: function() {
		return this.bucket;
	},

	expires: function(seconds) {
		var expires = new Date();
		expires.setSeconds(expires.getSeconds() + tools.absInt(seconds));
		return expires;
	},

	mergePath: function(path, query) {
		if (!path) {
			path = '/';
		}

		path = String(path);

		if (path.charAt(0) !== '/') {
			path = '/' + path;
		}

		var bucket = this.getBucket();
		if (bucket) {
			path = '/' + bucket + path;
		}

		if (!tools.isEmpty(query)) {
			var i, queryPieces = [];
			for (i in query) {
				if (query.hasOwnProperty(i)) {
					if (query[i] !== null) {
						queryPieces.push(i + '=' + query[i]);
					} else {
						queryPieces.push(i);
					}
				}
			}

			query = queryPieces.join('&');
			if (path.indexOf('?') === -1) {
				path += '?';
			} else {
				path += '&';
			}
			path = path + query;
		}

		return encodeURI(path);
	},

	getHeaders: function(method, path, headers) {
		if (!headers) {
			headers = {};
		}

		headers = tools.lowerCaseKeysObject(headers);
		headers.expect = '100-continue';

		// passing x-amz-date is a workaround for libraries
		// that don't send the date header ... this one does
		if (headers['x-amz-date']) {
			headers.date = headers['x-amz-date'];
			delete(headers['x-amz-date']);
		}

		if (!headers.date) {
			headers.date = new Date().toUTCString();
		}

		if (!headers['content-type']) {
			headers['content-type'] = 'text/plain';
		}

		if (this.getSessionToken()) {
			headers['x-amz-security-token'] = this.getSessionToken();
		}

		headers.authorization = 'AWS ' + this.getAccessKeyId() + ':' + this.sign(method, headers, path);

		return headers;
	},

	checkAcl: function(acl) {
		if (!acls.hasOwnProperty(acl)) {
			throw new Error('Invalid canned ACL.');
		}

		return true;
	},

	// the previously called "low level" methods which sit at the bottom of this client

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

		path = this.mergePath(path, {});

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

		return protocol + '://' + this.getEndPoint() + path + separator + signature;
	},

	// map the "RESTful" methods by wrapping the rest.js calls with the signs3.js signatures

	get: function(path, query, resHandler, callback) {
		if (!callback) {
			callback = resHandler;
			resHandler = query;
			query = {};
		}

		path = this.mergePath(path, query);
		this.$super(path, this.getHeaders('GET', path), resHandler, callback);
	},

	head: function(path, callback) {
		path = this.mergePath(path, {});
		this.$super(path, this.getHeaders('HEAD', path), callback);
	},

	delete: function(path, callback) {
		path = this.mergePath(path, {});
		this.$super(path, this.getHeaders('DELETE', path), callback);
	},

	del: function(path, callback) {
		console.error('Warning: the del method of the S3 client is deprecated. Use the delete method instead.');
		this.delete(path, callback);
	},

	put: function(path, headers, reqBody, callback) {
		if (!callback) {
			callback = reqBody;
			reqBody = headers;
			headers = {};
		}
		path = this.mergePath(path, {});
		this.$super(path, this.getHeaders('PUT', path, headers), reqBody, callback);
	},

	/*
	post: function() {
		// TODO
	}
	*/

	// the previously called "helper" methods which wrap the "RESTful" calls

	createBucket: function(bucket, acl, region, callback) {
		if (!callback) {
			callback = region;
			region = 'us-east-1';
		}

		if (region === false) {
			region = 'us-east-1';
		}

		var headers = {};
		var reqBody = null;

		this.setBucket(bucket);
		this.checkAcl(acl);
		this.setRegion(region);

		headers['x-amz-acl'] = acl;

		if (region !== 'us-east-1') {
			reqBody = new Buffer('<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><LocationConstraint>' + region + '</LocationConstraint></CreateBucketConfiguration>');
		}

		this.put('/', headers, reqBody, callback);
	},

	setBucketAcl: function(bucket, acl, callback) {
		this.setBucket(bucket);
		this.checkAcl(acl);

		this.put('/?acl', {
			'x-amz-acl': acl
		}, null, callback);
	},

	putFile: function() {

	},

	putStream: function() {

	},

	putBuffer: function() {

	}

	// TODO: putFile, putFiles, putStream, putBuffer, setObjectAcl, setObjectMeta, copyObject, moveObject, getLifeCycle, delLifeCycle, putLifeCycleRule, getLifeCycle, findLifeCycleRule, delLifeCycleRule, initUpload, abortUpload, completeUpload, putFilePart, putStreamPart, putBufferPart, putFileMultipart, delMultiObjects

});

// expose the FormData required by http-request to the S3 client
module.exports.FormData = http.FormData;
