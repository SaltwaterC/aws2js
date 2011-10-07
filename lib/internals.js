/* 3rd party module */
var libxml2js = require('libxml-to-js');
var mime = require('mime-magic');

/* core modules */
var fs = require('fs');
var p = require('path');
var https = require('https');
var crypto = require('crypto');
var qs = require('querystring');

/* the internally used modules */
require('./object.watch.js');
var cfg = require('./config.js');
var tools = require('./tools.js');

/**
 * Checks the config for the minimally allowable setup
 * @param config
 * @param callback
 * @returns bool
 */
var checkConfig = function(config, callback) {
	if ( ! config.accessKeyId || ! config.secretAccessKey) {
		var error = new Error('You must set the AWS credentials: accessKeyId + secretAccessKey');
		callback(error);
		return false;
	} else {
		return true;
	}
};
exports.checkConfig = checkConfig;
/**
 * Creates HMAC signatures for signing the requests as required by the AWS APIs
 * @param secretAccessKey
 * @param toSign
 * @param algo
 * @returns string
 */
var createHmac = function(secretAccessKey, toSign, algo) {
	return crypto.createHmac(algo, secretAccessKey).update(toSign).digest('base64');
};
exports.createHmac = createHmac;
/**
 * The muscle of this library aka the function that makes all the request - response machinery
 * @param config
 * @param options
 * @param body
 * @param handler
 * @param callback
 */
var makeRequest = function(config, options, body, handler, callback, requestId) {
	if (requestId == undefined) {
		requestId = 0;
	}
	options.host = config.host;
	if (config.path) {
		options.path = config.path;
	}
	if (body && typeof body == 'string') {
		options.headers['content-length'] = body.length;
	} else if (body) {
		try {
			if ( ! body.file) {
				throw new Error('Invalid body handler, expecting a file path.');
			}
			var bf = p.resolve(body.file);
			options.headers['content-length'] = fs.statSync(bf).size;
		} catch (err) {
			callback(err);
			return;
		}
	}
	var data = '';
	if (handler != 'xml' && handler != null) {
		try {
			if ( ! handler.file) {
				throw new Error('Invalid request file handler.');
			}
			handler.file = p.resolve(handler.file);
			var transfer = {
				ended: false
			};
			var file = fs.createWriteStream(handler.file);
			transfer.watch('ended', function() {
				transfer.unwatch('ended');
				file.on('open', function(fd) {
					fs.fsync(fd, function() {
						file.end();
					});
				});
			});
			file.on('error', function(error) {
				callback(error);
				file.destroy();
			});
			file.on('open', function(fd) {
				transfer.watch('ended', function() {
					fs.fsync(fd, function() {
						file.end();
					});
				});
			});
			file.on('close', function() {
				callback(null, {
					file: handler.file
				});
			});
		} catch (err) {
			callback(err);
			return;
		}
	}
	var aborted = false;
	var request = https.request(options, function(response) {
		var parseXml = function(data) {
			libxml2js(data, function(error, result) {
				if (response.statusCode != 200) {
					error = new Error('API error with HTTP Code: ' + response.statusCode);
					error.headers = response.headers;
					error.code = response.statusCode;
					if (result) {
						error.document = result;
					}
					callback(error);
				} else if (error) {
					error.headers = response.headers;
					error.code = response.statusCode;
					callback(error);
				} else {
					callback(null, result);
				}
			});
		};
		if (response.statusCode == 307) { // oh great ... S3 crappy redirect
			requestId++;
			if (requestId <= 10) {
				var location = url.parse(response.headers.location);
				options.host = location.hostname;
				delete (options.agent);
				setTimeout(function() {
					makeRequest(config, options, body, handler, callback, requestId);
				}, 500 * requestId);
			} else {
				var error = new Error('Redirect loop detected after 10 retries.');
				error.headers = response.headers;
				error.code = response.statusCode;
				callback(error);
			}
		} else { // continue with the response
			response.on('data', function(chunk) {
				if ( ! aborted) {
					switch (handler) {
						case 'xml':
							data += chunk;
						break;
						case null:
							if (response.statusCode != 200 && response.statusCode != 204) {
								data += chunk;
							}
						break;
						default:
							if (response.statusCode != 200) {
								data += chunk;
							} else {
								try {
									file.write(chunk);
								} catch (e) {
									aborted = true;
									request.abort();
								} // handled by the error listener
							}
						break;
					}
				}
			});
			response.on('end', function() {
				if ( ! aborted) {
					switch (handler) {
						case 'xml':
							parseXml(data);
						break;
						case null:
							switch (response.statusCode) {
								case 200:
								case 204:
									callback(null, response.headers);
								break;
								default:
									// treat it as error, parse the response
									parseXml(data);
								break;
							}
						break;
						default:
							if (response.statusCode != 200) { // parse the error
								parseXml(data);
							} else {
								transfer.ended = true;
							}
						break;
					}
				}
			});
			response.on('close', function() {
				if ( ! aborted) {
					var error = new Error('The server prematurely closed the connection.');
					error.headers = response.headers;
					error.code = response.statusCode;
					callback(error);
				}
			});
		}
	});
	request.on('error', function(error) {
		callback(error);
	});
	if (body) {
		if ( typeof body == 'string') {
			request.write(body);
			request.end();
		} else {
			var bfile = fs.ReadStream(bf);
			bfile.on('data', function(chunk) {
				if ( ! aborted) {
					request.write(chunk);
				}
			});
			bfile.on('end', function() {
				if ( ! aborted) {
					request.end();
				}
			});
			bfile.on('error', function(error) {
				aborted = true;
				request.abort();
				callback(error);
			});
		}
	} else {
		request.end();
	}
};
exports.makeRequest = makeRequest;
/**
 * Creates the signature string
 * @param config
 * @param query
 * @returns string
 */
var sign = function(config, query) {
	var keys = [];
	var sorted = {};
	for (var key in query) {
		keys.push(key);
	}
	keys = keys.sort();
	for (var n in keys) {
		var key = keys[n];
		sorted[key] = query[key];
	}
	var toSign = ['POST', config.host, config.path, qs.stringify(sorted)].join('\n');
	toSign = toSign.replace(/!/g, '%21');
	toSign = toSign.replace(/'/g, '%27');
	toSign = toSign.replace(/\*/g, '%2A');
	toSign = toSign.replace(/\(/g, '%28');
	toSign = toSign.replace(/\)/g, '%29');
	return createHmac(config.secretAccessKey, toSign, 'sha256');
};
exports.sign = sign;
/**
 * Authorizes an S3 request
 * @param config
 * @param method
 * @param headers
 * @param path
 * @returns string
 */
var authorize = function(config, method, headers, path) {
	var toSign = method + '\n';
	if (headers['content-md5']) {
		toSign += headers['content-md5'];
	}
	toSign += '\n';
	if (headers['content-type']) {
		toSign += headers['content-type'];
	}
	toSign += '\n' + headers.date + '\n';
	var keys = [];
	var sorted = {};
	for (var key in headers) {
		var amzPrefix = key.substr(0, 5);
		if (amzPrefix == 'x-amz') {
			keys.push(key);
		}
	}
	keys = keys.sort();
	for (var n in keys) {
		var key = keys[n];
		sorted[key] = headers[key].replace(/^\s*/, '').replace(/\s*$/, '');
	}
	for (var key in sorted) {
		toSign += key + ':' + sorted[key] + '\n';
	}
	if (config.useBucket) {
		path = '/' + config.useBucket + path;
	}
	toSign += path;
	return 'AWS ' + config.accessKeyId + ':' + createHmac(config.secretAccessKey, toSign, 'sha1');
};
/**
 * Returns the standard headers for an S3 request
 * @param config
 * @param method
 * @param headers
 * @param path
 * @param body
 * @returns object
 */
var standardHeaders = function(config, method, headers, path, body, callback) {
	if ( ! callback) {
		callback = body;
		body = {};
	}
	var hdr = tools.merge(headers, {
		date: new Date().toUTCString()
	});
	hdr = normalizeHeaders(hdr);
	if (body.file) {
		if ( ! hdr['content-type']) {
			mime.fileWrapper(p.resolve(body.file), function (err, res) {
				if (err) {
					callback(err);
				} else {
					hdr['content-type'] = res;
					hdr.authorization = authorize(config, method, hdr, path);
					callback(null, hdr);
				}
			});
			return;
		}
	}
	hdr.authorization = authorize(config, method, hdr, path);
	callback(null, hdr);
};
exports.standardHeaders = standardHeaders;
/**
 * Normalizez the header names to lowercase
 * @param hdr
 * @returns hdr
 */
var normalizeHeaders = function(hdr) {
	for (var name in hdr) {
		var lowName = name.toLowerCase();
		var val = hdr[name];
		delete (hdr[name]);
		hdr[lowName] = val;
	}
	return hdr;
};
exports.normalizeHeaders = normalizeHeaders;
/**
 * Minimal check for path integrity; escapes the path
 * @param path
 * @param callback
 * @returns bool / string
 */
var checkPath = function(path, callback) {
	if ( ! path) {
		var error = new Error('No path specified.');
		callback(error);
		return false;
	} else if (typeof path != 'string') {
		var error = new Error('The path must be a string.');
		callback(error);
		return false;
	}
	if (path.charAt(0) != '/') {
		path = '/' + path;
	}
	return tools.escapePath(path);
};
exports.checkPath = checkPath;
/**
 * Checks a canned ACL if it is valid
 * @param acl
 * @param headers
 * @param callback
 * @returns object / bool
 */
var checkAcl = function(acl, headers, callback) {
	if (acl) {
		if (acl in cfg.cannedAcls) {
			headers['x-amz-acl'] = acl;
			return headers;
		} else {
			error = new Error('Invalid ACL specification: ' + acl);
			callback(error);
			return false;
		}
	} else {
		return headers;
	}
};
exports.checkAcl = checkAcl;
