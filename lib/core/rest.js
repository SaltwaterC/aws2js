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

	head: function(path, callback) {
		console.log(path, callback); // XXX
	},

	put: function(path, headers, reqBodyHandler, callback) {
		console.log(path, headers, reqBodyHandler, callback); // XXX
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
		console.log(path, callback); // XXX
	},

	req: function(method, options, resHandler, callback) {
		var self = this;
		options.headers['user-agent'] = conf.userAgent;
		http[method](options, function(error, response) {
			switch (resHandler) { // see if self[resHandler + 'Handler'] is doable
				case 'xml':
					self.xmlHandler(error, response, callback);
					break;

				case 'json':
					self.jsonHandler(error, response, callback);
					break;

				default:
					throw new Error('Development mode error: unknown response handler.');
			}
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
	}
});
