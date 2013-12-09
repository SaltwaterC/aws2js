'use strict';

/* core module */
var qs = require('querystring');

/* 3rd party modules */
var ring = require('ring');
var http = require('http-request');
var parser = require('libxml-to-js');

/* internal modules */
var AWS = require('./aws.js');
var tools = require('./tools.js');
var conf = require('../../config/conf.js');

module.exports = ring.create(AWS, {
	constructor: function(config) {
		this.$super(config.endPoint, config.accessKeyId, config.secretAccessKey);
		this.setApiVersion(config.apiVersion);
	},

	setApiVersion: function(version) {
		// XXX validate the API version syntax
		this.apiVersion = String(version);
		return this;
	},

	getApiVersion: function() {
		return this.apiVersion;
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

		if (this.sessionToken) {
			query.SecurityToken = this.sessionToken;
		}

		query.Signature = this.sign(query);

		this.post({
			url: 'https://' + this.getEndPoint() + this.getPath(),
			headers: {
				'user-agent': conf.userAgent,
				'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
			},
			reqBody: new Buffer(qs.stringify(query))
		}, callback);
	},

	post: function(options, callback) {
		http.post(options, function(error, response) {
			if (error) {
				parser(error.document, function(err, res) {
					if (!err) {
						error.document = res;
					}
					callback(error);
				});
				return;
			}

			parser(response.buffer, function(err, res) {
				if (err) {
					callback(err);
					return;
				}

				callback(null, res);
			});
		});
	}
});
