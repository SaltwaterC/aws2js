/* core modules */
var crypto = require('crypto');
var qs = require('querystring');

/* 3rd party modules */
var http = require('http-request');
var parser = require('libxml-to-js');

/* internal modules */
var AWS = require('./aws.js');
var conf = require('../config/conf.js');

function Query (config) {
	AWS.call(this, config.endPoint, config.accessKeyId, config.secretAccessKey);
	this.apiVersion = config.apiVersion;
	this.path = '/';
};

require('util').inherits(Query, AWS);

Query.prototype.getApiVersion = function () {
	return this.apiVersion;
};

Query.prototype.request = function (action, query, callback) {
	if ( ! callback) {
		callback = query;
		query = {};
	}
	
	query.AWSAccessKeyId = this.accessKeyId;
	query.Version = this.apiVersion;
	
	query.Action = action;
	query.SignatureMethod = 'HmacSHA256';
	query.SignatureVersion = '2';
	query.Timestamp = new Date().toISOString();
	
	query.Signature = this.sign(query);
	
	http.post({
		url: this.endPoint + this.path,
		headers: {
			'user-agent': conf.userAgent,
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
		},
		reqBody: new Buffer(qs.stringify(query))
	}, function (error, response) {
		if (error) {
			parser(error.document, function (err, res) {
				if (!err) {
					error.document = res;
				}
				callback(error);
			});
			return;
		}
		
		parser(response.buffer, function (err, res) {
			if (err) {
				callback(err);
				return;
			}
			
			callback(null, res);
		});
	});
};

Query.prototype.sign = function (query) {
	var key, keys = [], i, sorted = {}, toSign;
	
	for (key in query) {
		if (query.hasOwnProperty(key)) {
			keys.push(key);
		}
	}
	
	keys = keys.sort();
	
	for (i = 0; i < keys.length; i++) {
		key = keys[i];
		sorted[key] = query[key];
	}
	
	toSign = [
		'POST',
		this.endPoint,
		this.path,
		qs.stringify(sorted)
	].join('\n');
	
	toSign = toSign.replace(/!/g, '%21');
    toSign = toSign.replace(/'/g, '%27');
    toSign = toSign.replace(/\*/g, '%2A');
    toSign = toSign.replace(/\(/g, '%28');
    toSign = toSign.replace(/\)/g, '%29');
	
	return crypto.createHmac('sha256', this.secretAccessKey).update(toSign).digest('base64');
};

module.exports = Query;
