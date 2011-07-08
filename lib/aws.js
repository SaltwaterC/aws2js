var https = require('https');
var crypto = require('crypto');
var libxml2js = require('libxml-to-js');
var qs = require('querystring');
var fs = require('fs');
var p = require('path');

/**
 * The values are reserved for future usage such as with the total failure
 * which is the S3 API
 */
var regions = {
	'us-east-1': '',
	'us-west-1': '',
	'eu-west-1': '',
	'ap-southeast-1': '',
	'ap-northeast-1': ''
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
	
	var makeRequest = function (options, body, handler, callback) {
		options.host = config.host;
		
		if (config.path) {
			options.path = config.path;
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
					}
					callback(error, result);
				});
			};
			
			response.on('data', function (chunk) {
				switch (handler) {
					case 'xml':
						data += chunk;
					break;
					
					case null:
						if (response.statusCode != 200) {
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
						if (response.statusCode != 200) { // parse the error
							parseXml(data);
						} else {
							callback(undefined, response.headers);
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
			
			for (n in keys) {
				var key = keys[n];
				sorted[key] = query[key];
			}
			
			var toSign = ['POST', config.host, config.path, qs.stringify(sorted)].join('\n');
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
			
			var body = qs.stringify(query);
			
			makeRequest({
				method: 'POST',
				headers: merge(headers, {
					Host: config.host,
					'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
					'Content-Length': body.length
				})
			}, body, 'xml', callback);
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
			if (config.useBucket) {
				path = '/' + config.useBucket + path;
			}
			toSign += path;
			return 'AWS ' + config.accessKeyId + ':' + createHmac(toSign, 'sha1');
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
		
		var standardHeaders = function (method, headers, path) {
			var hdr = merge(headers, {
				Date: new Date().toUTCString()
			});
			hdr.Authorization = authorize(method, hdr, path);
			return hdr;
		};
		
		config.get = function (path, handler, callback) {
			checkConfig();
			path = checkPath(path);
			var headers = standardHeaders('GET', {}, path);
			makeRequest({
				method: 'GET',
				host: config.host,
				path: path,
				headers: headers
			}, false, handler, callback);
		};
		
		config.head = function (path, callback) {
			checkConfig();
			path = checkPath(path);
			var headers = standardHeaders('HEAD', {}, path);
			makeRequest({
				method: 'HEAD',
				host: config.host,
				path: path,
				headers: headers
			}, false, null, callback);
		};
		
		config.post = function () {
			checkConfig();
			var method = 'POST';
			var signature = signS3(method);
		};
		
		config.put = function () {
			checkConfig();
			var method = 'PUT';
			var signature = signS3(method);
		};
		
		config.del = function () {
			checkConfig();
			var method = 'DELETE';
			var signature = signS3(method);
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
		SignatureMethod: 'HmacSHA256',
		SignatureVersion: '2'
	}
});

exports.ses = client({
	prefix: 'email',
	host: 'email.us-east-1.amazonaws.com',
	path: '/',
	signHeader: true
});

exports.s3 = client({
	prefix: 's3'
});
