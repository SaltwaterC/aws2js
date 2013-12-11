'use strict';

var ring = require('ring');
var http = require('http-request');

var AWS = require('./aws.js');

module.exports = ring.create(AWS, {
	get: function(path, query, resBodyHandler, callback) {
		console.log(path, query, resBodyHandler, callback); // XXX
	},

	head: function(path, callback) {
		console.log(path, callback); // XXX
	},

	put: function(path, headers, reqBodyHandler, callback) {
		console.log(path, headers, reqBodyHandler, callback); // XXX
	},

	post: function(path, headers, reqBodyHandler, callback) {
		console.log(path, headers, reqBodyHandler, callback); // XXX
	},

	delete: function(path, callback) {
		console.log(path, callback); // XXX
	},

	req: function(method, options, handler, callback) {
		console.log(handler, callback); // XXX
		http[method](options, function(error, response) {
			console.log(error, response); // XXX
		});
	}
});
