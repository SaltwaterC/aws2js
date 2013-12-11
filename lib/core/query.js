'use strict';

/* 3rd party modules */
var ring = require('ring');
var http = require('http-request');
var parser = require('libxml-to-js');

/* internal module */
var AWS = require('./aws.js');

module.exports = ring.create(AWS, {
	constructor: function(config) {
		this.$super(config.endPoint, config.accessKeyId, config.secretAccessKey);
		this.setApiVersion(config.apiVersion);
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
