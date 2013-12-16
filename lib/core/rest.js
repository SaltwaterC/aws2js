'use strict';

// not really RESTful, but Amazon likes to call it this way
// also wrapps the Query APIs with the post method

var http = require('http-request');
var xmlParser = require('libxml-to-js');

var conf = require('../../config/conf.js');

module.exports = require('ring').create({
	get: function(path, headers, resHandler, callback) {
		this.req('get', {
			url: 'https://' + this.getEndPoint() + path,
			headers: headers
		}, resHandler, callback);
	},

	head: function(path, headers, callback) {
		this.req('head', {
			url: 'https://' + this.getEndPoint() + path,
			headers: headers
		}, 'null', callback);
	},

	put: function(path, headers, reqBodyHandler, callback) {
		console.log(path, headers, reqBodyHandler, callback); // TODO
	},

	post: function(path, headers, reqBody, resHandler, callback) {
		if (!callback) {
			callback = resHandler;
			resHandler = 'xml';
		}
		this.req('post', {
			url: 'https://' + this.getEndPoint() + path,
			headers: headers,
			reqBody: reqBody
		}, resHandler, callback);
	},

	delete: function(path, callback) {
		console.log(path, callback); // TODO
	},

	req: function(method, options, resHandler, callback) {
		var self = this;
		options.headers['user-agent'] = conf.userAgent;

		// pass back an IncomingMessage instance
		if (resHandler === 'stream') {
			options.stream = true;
		}

		// enables the usage of calling a handler without the switch
		if (resHandler === null) {
			resHandler = 'null';
		}

		http[method](options, function(error, response) {
			self[resHandler + 'Handler'](error, response, callback);
		});
	},

	xmlHandler: function(error, response, callback) {
		if (error) {
			xmlParser(error.document, function(err, res) {
				if (!err) {
					error.document = res;
				}
				callback(error);
			});
			return;
		}

		xmlParser(response.buffer, function(err, res) {
			if (err) {
				callback(err);
				return;
			}

			callback(null, res);
		});
	},

	jsonHandler: function(error, response, callback) {
		if (error) {
			try {
				error.document = JSON.parse(error.document);
			} catch (err) {
				error.json = err;
			}

			callback(error);
			return;
		}

		try {
			callback(null, JSON.parse(response.buffer.toString()));
		} catch (err) {
			callback(err);
		}
	},

	streamHandler: function(error, response, callback) {
		if (error) {
			callback(error);
			return;
		}

		callback(null, response.stream);
	},

	nullHandler: function(error, response, callback) {
		// TODO: add an option to http-request to make it behave the same as passing the null file path
		if (error) {
			callback(error);
			return;
		}

		callback(null, response.headers);
	}
});
