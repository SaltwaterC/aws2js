/* 3rd party module */
var libxml2js = require('libxml-to-js');
var mime = require('mime-magic');

/* core modules */
var fs = require('fs');
var u = require('url');
var p = require('path');
var https = require('https');
var crypto = require('crypto');
var qs = require('querystring');
var Stream = require('stream').Stream;

/* the internally used modules */
require('./Object.watch.js');
require('./Buffer.toByteArray.js');
var cfg = require('./config.js');
var tools = require('./tools.js');

/**
 * Checks the config for the minimally allowable setup
 * @param config
 * @param callback
 * @return bool
 */
var checkConfig = function (config) {
	if ( ! config.accessKeyId || ! config.secretAccessKey) {
		throw new Error('You must set the AWS credentials: accessKeyId + secretAccessKey');
	}
	if (config.prefix == 'dynamodb' && ! config.sessionToken) {
		throw new Error('You must pass a sessionToken argument along with the AWS credentials.');
	}
};
exports.checkConfig = checkConfig;
// TODO: break it in smaller pieces since it's almost 300 LOC
/**
 * The muscle of this library aka the function that makes all the request - response machinery
 * @param config
 * @param options
 * @param body
 * @param handler
 * @param callback
 */
var makeRequest = function (config, options, body, handler, callback, requestId) {
	if (requestId == undefined) {
		requestId = 0;
	}
	options.host = config.host;
	if (config.path) {
		options.path = config.path;
	}
	if (body) {
		switch (typeof body) {
			case 'string':
				options.headers['content-length'] = body.length;
			break;
			case 'object':
				var haveBodyHandler = false;
				if (body instanceof Buffer) {
					haveBodyHandler = true;
					options.headers['content-length'] = body.length;
				}
				if (body instanceof Stream) {
					haveBodyHandler = true;
				}
				if ( ! haveBodyHandler) {
					if ( ! body.file) {
						throw new Error('Invalid body handler, expecting a file path.');
					}
					if (body.options) {
						body.options = filterByteRange(body.options, options.headers['content-length'], callback);
						if ( ! body.options) {
							return;
						}
						options.headers['content-length'] = body.options.length;
						delete(body.options.length);
					}
				}
			break;
			default:
				throw new Error('Invalid request body handler. Expecting a String or Object.');
			break;
		}
	}
	if (handler != 'xml' && handler != 'buffer' && handler != 'stream' && handler != 'json' && handler != null) {
		try {
			if ( ! handler.file) {
				throw new Error('Invalid response body handler. Expecting an object containing a file path.');
			}
			handler.file = p.resolve(handler.file);
			var transfer = {
				ended: false
			};
			var file = fs.createWriteStream(handler.file);
			transfer.watch('ended', function () {
				transfer.unwatch('ended');
				file.on('open', function (fd) {
					fs.fsync(fd, function () {
						file.end();
					});
				});
			});
			file.on('error', function (error) {
				callback(error);
				file.destroy();
			});
			file.on('open', function (fd) {
				transfer.watch('ended', function () {
					fs.fsync(fd, function () {
						file.end();
					});
				});
			});
			file.on('close', function () {
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
	var data = [];
	var request = https.request(options, function (response) {
		var parseXml = function (data) {
			libxml2js(new Buffer(data).toString(), function (error, result) {
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
				var location = u.parse(response.headers.location);
				options.host = location.hostname;
				delete (options.agent);
				setTimeout(function () {
					makeRequest(config, options, body, handler, callback, requestId);
				}, 500 * requestId);
			} else {
				var error = new Error('Redirect loop detected after 10 retries.');
				error.headers = response.headers;
				error.code = response.statusCode;
				callback(error);
			}
		} else { // continue with the response
			if (handler == 'stream') {
				if (response.statusCode == 200) {
					callback(null, response);
					return;
				}
			}
			response.on('data', function (chunk) {
				if ( ! aborted) {
					switch (handler) {
						case 'xml':
						case 'buffer':
						case 'stream':
						case 'json':
							data = data.concat(chunk.toByteArray());
						break;
						case null:
							if (response.statusCode != 200 && response.statusCode != 204) {
								data = data.concat(chunk.toByteArray());
							}
						break;
						default:
							if (response.statusCode != 200) {
								data = data.concat(chunk.toByteArray());
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
			response.on('end', function () {
				if ( ! aborted) {
					switch (handler) {
						case 'xml':
						case 'stream':
							parseXml(data);
						break;
						case 'buffer':
							if (response.statusCode == 200) {
								callback(null, {
									headers: response.headers,
									buffer: new Buffer(data)
								});
							} else {
								parseXml(data);
							}
						break;
						case 'json':
							try {
								if (response.statusCode == 200) {
									callback(null, JSON.parse(new Buffer(data).toString()));
								} else {
									var error = new Error('API error with HTTP Code: ' + response.statusCode);
									error.headers = response.headers;
									error.code = response.statusCode;
									error.document = JSON.parse(new Buffer(data).toString());
									callback(error);
								}
							} catch (e) {
								callback(e);
							}
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
			response.on('close', function () {
				if ( ! aborted) {
					if (data.length > 0) {
						// Try parsing the data we have - most often it seems to be a well-formed response
						parseXml(data);
					} else {
						var error = new Error('The server prematurely closed the connection and there was no data.');
						error.headers = response.headers;
						error.code = response.statusCode;
						callback(error);
					}
				}
			});
		}
	});
	request.on('error', function (error) {
		callback(error);
	});
	if (body) {
		if (typeof body == 'string') {
			request.write(body);
			request.end();
			return;
		}
		if (typeof body == 'object') {
			if (body instanceof Buffer) {
				request.write(body);
				request.end();
				return;
			}
			if (body instanceof Stream) { // some requests don't like body.pipe(request). bummer.
				body.on('data', function (chunk) {
					if ( ! aborted) {
						request.write(chunk);
					}
				});
				body.on('end', function () {
					if ( ! aborted) {
						request.end();
					}
				});
				return;
			}
			if ( ! haveBodyHandler) {
				if (body.options) {
					var bfile = fs.ReadStream(body.file, body.options);
				} else {
					var bfile = fs.ReadStream(body.file);
				}
				bfile.on('data', function (chunk) {
					if ( ! aborted) {
						request.write(chunk);
					}
				});
				bfile.on('end', function () {
					if ( ! aborted) {
						request.end();
					}
				});
				bfile.on('error', function (error) {
					aborted = true;
					request.abort();
					callback(error);
				});
			}
		}
	} else {
		request.end();
	}
};
exports.makeRequest = makeRequest;
/**
 * Filters the byte range for a ReadStream
 * @param range
 * @param callback
 * @return object / bool
 */
var filterByteRange = function (range, length, callback) {
	if ( ! isNaN(Number(range.start))) {
		if (range.start < 0) {
			range.start = 0;
		}
		if (length) {
			if (range.start >= length) {
				var err = new Error('The start value of a byte range can\'t be more that the file length.');
				callback(err);
				return false;
			}
		}
	}
	if ( ! isNaN(Number(range.end))) {
		if (length) {
			if (range.end > length - 1) {
				range.end = length - 1;
			}
		}
		if (range.end < 0) {
			var err = new Error('The end value of a byte range can\'t be less than 0.');
			callback(err);
			return false;
		}
	}
	if (Number(range.end) > 0 && isNaN(Number(range.start))) {
		range.start = 0; // the node.js upstream is dumb about this ...
	}
	if (Number(range.start) >= 0 && isNaN(Number(range.end))) {
		range.end = length - 1;
	}
	if (range.start > range.end) {
		var err = new Error('The start value of a byte range must be lower than the end value.');
		callback(err);
		return false;
	}
	if ( ! isNaN(range.start) && ! isNaN(range.end)) {
		if (length) {
			range.length = range.end - range.start + 1;
		}
	} else {
		delete(range.start);
		delete(range.end);
	}
	return range;
};
exports.filterByteRange = filterByteRange;
/**
 * Creates HMAC signatures for signing the requests as required by the AWS APIs
 * @param secretAccessKey
 * @param toSign
 * @param algo
 * @return string
 */
var createHmac = function (secretAccessKey, toSign, algo) {
	return crypto.createHmac(algo, secretAccessKey).update(toSign).digest('base64');
};
exports.createHmac = createHmac;
/**
 * Creates the signature string for requests which sign headers
 * @param config
 * @param clientHeaders
 * @param clientBody
 * @return string
 */
var signHeaders = function (config, clientHeaders, clientBody, date) {
	var toSign = ['POST', '/', '', 'date:' + date, 'host:' + config.host];
	var keys = [];
	for (var key in clientHeaders) {
		if (key.match(/^x-amz-/)) {
			keys.push(key);
		}
	}
	keys = keys.sort();
	var xAmz = '';
	for (var n in keys) {
		if (keys.hasOwnProperty(n)) {
			var key = keys[n];
			xAmz += key + ':' + clientHeaders[key] + '\n';
		}
	}
	toSign.push(xAmz);
	toSign.push(clientBody);
	var hash =  crypto.createHash('sha256');
	hash.update(toSign.join('\n'));
	toSign = hash.digest('binary');
	return createHmac(config.secretAccessKey, new Buffer(toSign, 'binary'), 'sha256');
};
exports.signHeaders = signHeaders;
/**
 * Creates the signature string
 * @param config
 * @param query
 * @return string
 */
var sign = function (config, query) {
	var keys = [];
	var sorted = {};
	for (var key in query) {
		keys.push(key);
	}
	keys = keys.sort();
	for (var n in keys) {
		if (keys.hasOwnProperty(n)) {
			var key = keys[n];
			sorted[key] = query[key];
		}
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
 * @return string
 */
var authorize = function (config, method, headers, path) {
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
		sorted[key] = headers[key].trim();
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
 * Computes the Content-Length header where applicable
 * @param config
 * @param file
 * @param headers
 * @param callback
 */
var contentLength = function (file, config, method, headers, path, callback) {
	fs.stat(file, function (err, stats) {
		if (err) {
			callback(err);
		} else {
			headers['content-length'] = stats.size;
			headers['authorization'] = authorize(config, method, headers, path);
			callback(null, headers);
		}
	});
};
/**
 * Returns the standard headers for an S3 request
 * @param config
 * @param method
 * @param headers
 * @param path
 * @param body
 * @return object
 */
var standardHeaders = function (config, method, headers, path, body, callback) {
	if ( ! callback) {
		callback = body;
		body = {};
	}
	var elements = u.parse(path);
	path = elements.pathname;
	if (elements.hash) {
		path += elements.hash;
	}
	path = path.replace('%27', "'");
	var query = tools.sortObject(qs.parse(elements.query));
	if ( ! tools.isEmpty(query)) {
		var queryParts = [];
		for (var key in query) {
			if (key in cfg.subResource) {
				if (query[key]) {
					queryParts.push(key + '=' + query[key]);
				} else {
					queryParts.push(key);
				}
			}
		}
		if (queryParts.length > 0) {
			path += '?' + queryParts.join('&');
		}
	}
	var hdr = tools.merge(headers, {
		date: new Date().toUTCString()
	});
	hdr = normalizeHeaders(hdr);
	if (config.sessionToken) {
		hdr['x-amz-security-token'] = config.sessionToken;
	}
	if (body.file) {
		if ( ! hdr['content-type']) {
			mime.fileWrapper(body.file, function (err, res) {
				if (err) {
					callback(err);
				} else {
					hdr['content-type'] = res;
					contentLength(body.file, config, method, hdr, path, callback);
					return;
				}
			});
			return;
		} else {
			if ( ! hdr['content-length']) {
				contentLength(body.file, config, method, hdr, path, callback);
				return;
			}
		}
	}
	hdr.authorization = authorize(config, method, hdr, path);
	callback(null, hdr);
};
exports.standardHeaders = standardHeaders;
/**
 * Normalizez the header names to lowercase
 * @param hdr
 * @return hdr
 */
var normalizeHeaders = function (hdr) {
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
 * @return bool / string
 */
var checkPath = function (path, callback, query) {
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
	if ( ! tools.isEmpty(query)) {
		var queryPieces = [];
		for (var i in query) {
			if (query[i] !== null) {
				queryPieces.push(i + '=' + query[i]);
			} else {
				queryPieces.push(i);
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
	path = encodeURI(path);
	return path;
};
exports.checkPath = checkPath;
/**
 * Checks a canned ACL if it is valid
 * @param acl
 * @param headers
 * @param callback
 * @return object / bool
 */
var checkAcl = function (acl, headers, callback) {
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
/**
 * Removes the extra weight from the API version
 * @param config
 * @return string
 */
var squashApiVersion = function (config) {
	return config.query.Version.replace(/-/g, '');
};
exports.squashApiVersion = squashApiVersion;
