/* 3rd party modules */
var mime = require('mime');
var libxml2js = require('libxml-to-js');

/* core modules */
var fs = require('fs');
var p = require('path');
var url = require('url');
var crypto = require('crypto');
var qs = require('querystring');

/* backported core module */
var https = require('backport-0.4').load('https');

/**
 * Simple object merger
 * 
 * @param obj1
 * @param obj2
 * @returns obj3
 */
var merge = function (obj1, obj2) {
	var obj3 = {};
	
	for (attrname in obj1) {
		obj3[attrname] = obj1[attrname];
	}
	
	for (attrname in obj2) {
		obj3[attrname] = obj2[attrname];
	}
	
	return obj3;
};

/**
 * Returns the absolute integer value of the input. Avoids the NaN crap.
 * @param value
 * @returns value
 */
var absInt = function (value) {
	return Math.abs(parseInt(value) | 0);
};

/**
 * The client itself
 * 
 * @param config
 * @returns config
 */
var client = function (config) {
	var suffix = '.amazonaws.com';
	
	/**
	 * The values are reserved for future usage such as with the total failure
	 * which is the S3 API
	 */
	var regions = {
		'us-east-1': '',
		'us-west-1': 'us-west-1',
		'eu-west-1': 'EU',
		'ap-southeast-1': 'ap-southeast-1',
		'ap-northeast-1': 'ap-northeast-1'
	};
	
	if ( ! config.host) {
		config.host = config.prefix + suffix;
	}
	
	/**
	 * Used internally
	 */
	var checkConfig = function (callback) {
		if ( ! config.accessKeyId || ! config.secretAccessKey) {
			var error = new Error('You must set the AWS credentials: accessKeyId + secretAccessKey');
			callback(error);
			return false;
		} else {
			return true;
		}
	};
	
	var createHmac = function (toSign, algo) {
		return crypto.createHmac(algo, config.secretAccessKey).update(toSign).digest('base64');
	};
	
	var makeRequest = function (options, body, handler, callback, requestId) {
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
		switch (handler) {
			case 'xml':
				// placeholder
			break;
			
			case null:
				// placeholder
			break;
			
			default:
				try {
					if ( ! handler.file) {
						throw new Error('Invalid request file handler.');
					}
					var file = fs.createWriteStream(handler.file);
					file.on('error', function (error) {
						callback(error);
						file.destroy();
					});
				} catch (err) {
					callback(err);
					return;
				}
			break;
		}
		
		var request = https.request(options, function (response) {
			var parseXml = function (data) {
				libxml2js(data, function (error, result) {
					if (response.statusCode != 200) {
						error = new Error('API error with HTTP Code: ' + response.statusCode);
						error.headers = response.headers;
						error.code = response.statusCode;
					}
					callback(error, result);
				});
			};
			
			if (response.statusCode == 307) { // oh great ... S3 crappy redirect
				requestId++;
				if (requestId <= 10) {
					var location = url.parse(response.headers.location);
					options.host = location.hostname;
					delete(options.agent);
					setTimeout(function () {
						makeRequest(options, body, handler, callback, requestId);
					}, 500 * requestId);
				} else {
					var error = new Error('Redirect loop detected after 10 retries.');
					error.headers = response.headers;
					error.code = response.statusCode;
					callback(error);
				}
			} else { // continue with the response
				response.on('data', function (chunk) {
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
									request.abort();
								} // handled by the error listener
							}
						break;
					}
				});
				
				response.on('end', function () {
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
								default: // treat it as error, parse the response
									parseXml(data);
								break;
							}
						break;
						
						default:
							if (response.statusCode != 200) { // parse the error
								parseXml(data);
							} else {
								try {
									file.end();
									callback(null, {path: p.resolve(file.path)});
								} catch (e) {} // handled by the error listener
							}
						break;
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
			} else {
				var bfile = fs.ReadStream(bf);
				bfile.on('data', function (chunk) {
					request.write(chunk);
				});
				bfile.on('end', function () {
					request.end();
				});
				bfile.on('error', function (error) {
					request.abort();
					callback(error);
				});
			}
		} else {
			request.end();
		}
	};
	
	/**
	 * Globally accessible
	 */
	config.setCredentials = function (accessKeyId, secretAccessKey) {
		config = merge(config, {
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey
		});
	};
	
	config.setMaxSockets = function (value) {
		value = absInt(value);
		if ( ! value) { // fallback to the default
			value = 5;
		}
		https.Agent.defaultMaxSockets = value;
	};
	
	/**
	 * Accessible by query APIs except SES, IAM
	 */
	if (config.prefix != 'email' && config.prefix != 'iam' && config.prefix != 's3') {
		config.setRegion = function (region) {
			if (region in regions) {
				config = merge(config, {
					host: config.prefix + '.' + region + suffix
				});
			} else {
				throw new Error('Invalid region: ' + region);
			}
		};
	}
	
	/**
	 * In use by the query APIs
	 */
	if (config.prefix != 's3') {
		/**
		 * Creates the signature
		 */
		var sign = function (query) {
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
			
			return createHmac(toSign, 'sha256');
		};
		
		/**
		 * The "low level" call to the APIs
		 */
		config.call = function (action, query, callback) {
			if ( ! checkConfig(callback)) {
				return;
			}
			query.Action = action;
			query = merge(query, config.query);
			
			var now = new Date();
			var headers = {};
			
			if ( ! config.signHeader) {
				query = merge(query, {
					Timestamp: now.toISOString(),
					AWSAccessKeyId: config.accessKeyId
				});
				query.Signature = sign(query);
			} else {
				headers = {
					date: now.toUTCString(),
					'x-amzn-authorization': 'AWS3-HTTPS AWSAccessKeyId=' +
						config.accessKeyId + ', Algorithm=HmacSHA256, ' +
						'signature=' + createHmac(now.toUTCString(), 'sha256')
				};
			}
			
			makeRequest({
				method: 'POST',
				headers: merge(headers, {
					host: config.host,
					'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
				})
			}, qs.stringify(query), 'xml', callback);
		};
	}
	
	/**
	 * In use by the S3 REST API. In the AWS land, in the AWS dictionaries, the
	 * word "consistency" is missing. MIA. KIA. Who knows ...
	 */
	if (config.prefix == 's3') {
		var cannedAcls = {
			'private': '',
			'public-read': '',
			'public-read-write': '',
			'authenticated-read': '',
			'bucket-owner-read': '',
			'bucket-owner-full-control': ''
		};
		
		var authorize = function (method, headers, path) {
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
			
			return 'AWS ' + config.accessKeyId + ':' + createHmac(toSign, 'sha1');
		};
		
		var standardHeaders = function (method, headers, path, body) {
			if (body == undefined) {
				body = {};
			}
			var hdr = merge(headers, {
				date: new Date().toUTCString()
			});
			hdr = normalizeHeaders(hdr);
			if (body.file) {
				var bf = p.resolve(body.file);
				if ( ! hdr['content-type']) {
					hdr['content-type'] = mime.lookup(bf);
				}
			}
			hdr.authorization = authorize(method, hdr, path);
			return hdr;
		};
		
		var normalizeHeaders = function (hdr) {
			for (var name in hdr) { // normalize the headers to lower case
				var lowName = name.toLowerCase();
				var val = hdr[name];
				delete(hdr[name]);
				hdr[lowName] = val;
			}
			return hdr;
		};
		
		var checkPath = function (path, callback) {
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
			return path;
		};
		
		var checkAcl = function (acl, headers, callback) {
			if (acl) {
				if (acl in cannedAcls) {
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
		
		/**
		 * The low level methods
		 */
		config.get = function (path, handler, callback) {
			if ( ! checkConfig(callback)) {
				return;
			}
			path = checkPath(path, callback);
			if ( ! path) {
				return;
			}
			makeRequest({
				method: 'GET',
				path: path,
				headers: standardHeaders('GET', {}, path)
			}, false, handler, callback);
		};
		
		config.head = function (path, callback) {
			if ( ! checkConfig(callback)) {
				return;
			}
			path = checkPath(path, callback);
			if ( ! path) {
				return;
			}
			makeRequest({
				method: 'HEAD',
				path: path,
				headers: standardHeaders('HEAD', {}, path)
			}, false, null, callback);
		};
		
		config.del = function (path, callback) {
			if ( ! checkConfig(callback)) {
				return;
			}
			path = checkPath(path, callback);
			if ( ! path) {
				return;
			}
			if ( ! config.useBucket) {
				var error = new Error('The DELETE method requires the usage of client.setBucket().');
				callback(error);
				return;
			}
			makeRequest({
				method: 'DELETE',
				path: path,
				headers: standardHeaders('DELETE', {'content-length': 0}, path)
			}, false, null, callback);
		};
		
		config.put = function (path, headers, body, callback) {
			if ( ! checkConfig(callback)) {
				return;
			}
			path = checkPath(path, callback);
			if ( ! path) {
				return;
			}
			makeRequest({
				method: 'PUT',
				path: path,
				headers: standardHeaders('PUT', merge(headers, {
						'content-length': 0
					}), path, body)
			}, body, null, callback);
		};
		
		/**
		 * The helper methods
		 */
		config.setBucket = function (bucket) {
			config = merge(config, {
				host: bucket + '.' + config.prefix + suffix,
				useBucket: bucket
			});
		};
		
		config.createBucket = function (bucket, acl, region, callback) {
			config.setBucket(bucket);
			var headers = {'x-amz-acl': 'private'};
			var body = false;
			headers = checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			if (region) {
				if (region in regions) {
					body = '<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><LocationConstraint>' + regions[region] + '</LocationConstraint></CreateBucketConfiguration>';
				} else {
					error = new Error('Invalid region: ' + region);
					callback(error);
					return;
				}
			}
			config.put('/', headers, body, callback);
		};
		
		config.setBucketAcl = function (bucket, acl, callback) {
			config.setBucket(bucket);
			var headers = {'x-amz-acl': 'private'};
			headers = checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			config.put('/?acl', headers, false, callback);
		};
		
		config.putObject = function (path, file, acl, headers, callback) {
			path = checkPath(path, callback);
			if ( ! path) {
				return;
			}
			file = p.resolve(file);
			headers = normalizeHeaders(headers);
			headers = checkAcl(acl, headers, callback);
			headers.expect = '100-continue';
			if ( ! headers) {
				return;
			}
			if (headers['content-md5']) {
				config.put(path, headers, {file: file}, callback);
			} else {
				var md5 = crypto.createHash('md5');
				var bf = fs.ReadStream(file);
				bf.on('data', function (chunk) {
					md5.update(chunk);
				});
				bf.on('end', function () {
					headers['content-md5'] = md5.digest('base64');
					config.put(path, headers, {file: file}, callback);
				});
				bf.on('error', function (error) {
					callback(error);
				});
			}
		};
		
		config.setObjectAcl = function (path, acl, callback) {
			path = checkPath(path, callback);
			if ( ! path) {
				return;
			}
			var headers = {'x-amz-acl': 'private'};
			headers = checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			config.put(path + '?acl', headers, false, callback);
		};
		
		config.setObjectMeta = function (path, acl, headers, callback) {
			path = checkPath(path, callback);
			if ( ! path) {
				return;
			}
			headers = normalizeHeaders(headers);
			headers = checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			headers['x-amz-copy-source'] = '/' + config.useBucket + path;
			headers['x-amz-metadata-directive'] = 'REPLACE';
			config.head(path, function (error, response) {
				if (error) {
					callback(error, response);
				} else {
					headers['content-type'] = response['content-type'];
					config.put(path, headers, false, callback);
				}
			});
		};
	}
	
	return config;
};

/**
 * The actual clients with the default config. Loaded on demand.
 */

var config = {
	ec2: {
		prefix: 'ec2',
		path: '/',
	    query: {
	    	Version: '2011-05-15',
	    	SignatureMethod: 'HmacSHA256',
			SignatureVersion: '2'
	    }
	},
	
	rds: {
		prefix: 'rds',
		path: '/',
		query: {
			Version: '2011-04-01',
			SignatureMethod: 'HmacSHA256',
			SignatureVersion: '2'
		}
	},
	
	ses: {
		prefix: 'email',
		host: 'email.us-east-1.amazonaws.com',
		path: '/',
		signHeader: true,
		query: {
			Version: '2010-12-01'
		}
	},
	
	elb: {
		prefix: 'elasticloadbalancing',
		path: '/',
		query: {
			Version: '2011-04-05',
			SignatureMethod: 'HmacSHA256',
			SignatureVersion: '2'
		}
	},
	
	s3: {
		prefix: 's3'
	},
	
	iam: {
		prefix: 'iam',
		path: '/',
		host: 'iam.amazonaws.com',
		query: {
			Version: '2010-05-08',
			SignatureMethod: 'HmacSHA256',
			SignatureVersion: '2'
		}
	},
	
	autoscaling: {
		prefix: 'autoscaling',
		path: '/',
		query: {
			Version: '2010-08-01',
			SignatureMethod: 'HmacSHA256',
			SignatureVersion: '2'
		}
	}
};

exports.load = function (cl) {
	if ( ! config[cl]) {
		throw new Error('Invalid AWS client');
	}
	return client(config[cl]);
};
