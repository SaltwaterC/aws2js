var libxml2js = require('libxml-to-js');

var fs = require('fs');
var p = require('path');
var url = require('url');
var https = require('https');
var crypto = require('crypto');
var qs = require('querystring');

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
 * The client itself
 * 
 * @param config
 * @returns config
 */
var client = function (config) {
	var suffix = '.amazonaws.com';
	
	if ( ! config.host) {
		config.host = config.prefix + suffix;
	}
	
	/**
	 * Used internally
	 */
	var checkConfig = function () {
		if ( ! config.accessKeyId || ! config.secretAccessKey) {
			throw new Error('You must set the AWS credentials: accessKeyId + secretAccessKey');
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
		
		if (body) {
			options.headers['Content-Length'] = body.length;
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
					var file = fs.createWriteStream(handler);
					file.on('error', function (error) {
						callback(error, {});
						file.destroy();
					});
				} catch (err) {
					callback(err, {});
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
					callback(error, {});
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
								} catch (e) {} // handled by the error listener
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
									callback(undefined, response.headers);
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
									callback(undefined, {path: p.resolve(file.path)});
								} catch (e) {} // handled by the error listener
							}
						break;
					}
				});
			}
		});
		
		request.on('error', function (error) {
			callback(error, {});
		});
		
		if (body) {
			request.write(body);
		}
		
		request.end();
	};
	
	/**
	 * Globally accesible
	 */
	config.setCredentials = function (accessKeyId, secretAccessKey) {
		config = merge(config, {
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey
		});
	};
	
	config.config = function (cfg) {
		config = merge(config, cfg);
	};
	
	/**
	 * Accesible by specialized APIs
	 */
	if (config.prefix != 'email' && config.prefix != 's3') {
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
	
	if (config.prefix == 's3') {
		config.setBucket = function (bucket) {
			config = merge(config, {
				host: bucket + '.' + config.prefix + suffix,
				useBucket: bucket
			});
		};
	}
	
	/**
	 * In use by EC2, RDS, SES "query APIs"
	 */
	if (config.prefix != 's3') {
		/**
		 * Creates the signature for EC2, RDS
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
			checkConfig();
			
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
					Date: now.toUTCString(),
					'x-amzn-authorization': 'AWS3-HTTPS AWSAccessKeyId=' +
						config.accessKeyId + ', Algorithm=HmacSHA256, ' +
						'Signature=' + createHmac(now.toUTCString(), 'sha256')
				};
			}
			
			makeRequest({
				method: 'POST',
				headers: merge(headers, {
					Host: config.host,
					'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
				})
			}, qs.stringify(query), 'xml', callback);
		};
	}
	
	/**
	 * In use by the S3 REST API. In the AWS land, in the AWS dictionaries, the
	 * word "consistency" is missing. MIA. KIA. Who knows ...
	 */
	if (config.prefix == 's3') {
		var authorize = function (method, headers, path) {
			var toSign = method + '\n';
			
			if (headers['Content-MD5']) {
				toSign += headers['Content-MD5'];
			}
			toSign += '\n';
			if (headers['Content-Type']) {
				toSign += headers['Content-Type'];
			}
			toSign += '\n' + headers.Date + '\n';
			
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
				sorted[key] = headers[key];
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
		
		var standardHeaders = function (method, headers, path) {
			var hdr = merge(headers, {
				Date: new Date().toUTCString()
			});
			for (var name in hdr) {
				var lowName = name.toLowerCase();
				var amzPrefix = lowName.substr(0, 5);
				if (amzPrefix == 'x-amz') {
					var val = hdr[name].replace(/^\s*/, '').replace(/\s*$/, '');
					delete(hdr[name]);
					hdr[lowName] = val;
				}
			}
			hdr.Authorization = authorize(method, hdr, path);
			return hdr;
		};
		
		var checkPath = function (path) {
			if ( ! path) {
				throw new Error('No path specified.');
			} else if (typeof path != 'string') {
				throw new Error('The path must be a string.');
			}
			if (path.charAt(0) != '/') {
				path = '/' + path;
			}
			return path;
		};
		
		config.get = function (path, handler, callback) {
			checkConfig();
			path = checkPath(path);
			makeRequest({
				method: 'GET',
				path: path,
				headers: standardHeaders('GET', {}, path)
			}, false, handler, callback);
		};
		
		config.head = function (path, callback) {
			checkConfig();
			path = checkPath(path);
			makeRequest({
				method: 'HEAD',
				path: path,
				headers: standardHeaders('HEAD', {}, path)
			}, false, null, callback);
		};
		
		config.del = function (path, callback) {
			checkConfig();
			path = checkPath(path);
			if ( ! config.useBucket) {
				throw new Error('The DELETE method requires the usage of client.setBucket().');
			}
			makeRequest({
				method: 'DELETE',
				path: path,
				headers: standardHeaders('DELETE', {'Content-Length': 0}, path)
			}, false, null, callback);
		};
		
		config.put = function (path, headers, body, callback) {
			checkConfig();
			makeRequest({
				method: 'PUT',
				path: path,
				headers: standardHeaders('PUT', merge(headers, {
						'Content-Length': 0
					}), path)
			}, body, null, callback);
		};
		
		config.post = function (path, headers, body, callback) {
			checkConfig();
			makeRequest({
				method: 'POST',
				path: path,
				headers: standardHeaders('POST', merge(headers, {
					'Content-Type': 'multipart/form-data; boundary=aws2js'
				}), path)
			}, body, null, callback);
		};
	}
	
	return config;
};

/**
 * The actual clients with the default config
 */

exports.ec2 = client({
	prefix: 'ec2',
	path: '/',
    query: {
    	Version: '2011-05-15',
    	SignatureMethod: 'HmacSHA256',
		SignatureVersion: '2'
    }
});

exports.rds = client({
	prefix: 'rds',
	path: '/',
	query: {
		Version: '2011-04-01',
		SignatureMethod: 'HmacSHA256',
		SignatureVersion: '2'
	}
});

exports.ses = client({
	prefix: 'email',
	host: 'email.us-east-1.amazonaws.com',
	path: '/',
	signHeader: true,
	query: {
		Version: '2010-12-01'
	}
});

exports.elb = client({
	prefix: 'elasticloadbalancing',
	path: '/',
	query: {
		Version: '2011-04-05',
		SignatureMethod: 'HmacSHA256',
		SignatureVersion: '2'
	}
});

exports.s3 = client({
	prefix: 's3',
	bucketConfig: function (region) {
		if (region in regions) {
			return '<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><LocationConstraint>' + regions[region] + '</LocationConstraint></CreateBucketConfiguration>';
		} else {
			throw new Error('Invalid region: ' + region);
		}
	}
});
