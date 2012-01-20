/* core modules */
var fs = require('fs');
var p = require('path');
var https = require('https');
var crypto = require('crypto');
var qs = require('querystring');

/* the internally used modules */
var cfg = require('./config.js');
var tools = require('./tools.js');
var internals = require('./internals.js');

/**
 * The client itself
 * @param config
 * @return config
 */
var client = function (config) {
	if ( ! config.host) {
		config.host = config.prefix + cfg.suffix;
	}
	/* globally accessible */
	/**
	 * Mandatory helper for setting the credentials
	 * @param accessKeyId
	 * @param secretAccessKey
	 */
	config.setCredentials = function (accessKeyId, secretAccessKey, sessionToken) {
		var credentials = {
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey
		};
		if (sessionToken) {
			credentials.sessionToken = sessionToken;
		}
		config = tools.merge(config, credentials);
		return config;
	};
	/**
	 * Sets the concurrency level for the core HTTPS support
	 * @param value
	 */
	config.setMaxSockets = function (value) {
		value = tools.absInt(value);
		if ( ! value) { // fallback to the default
			value = 5;
		}
		https.Agent.defaultMaxSockets = value;
		return config;
	};
	/**
	 * Gets the defined endpoint
	 * @return string
	 */
	config.getEndPoint = function () {
		return config.host;
	};
	/* accessible by query APIs except the ones listed in cfg.noRegion */
	if ( ! (config.prefix in cfg.noRegion)) {
		/**
		 * Sets the region where the query API operates
		 * @param region
		 */
		config.setRegion = function (region) {
			if (region in cfg.regions) {
				if (config.prefix === 'sdb' && region === 'us-east-1') {
					config = tools.merge(config, {
						host: config.prefix + cfg.suffix
					});
				} else {
					config = tools.merge(config, {
						host: config.prefix + '.' + region + cfg.suffix
					});
				}
				return config;
			} else {
				throw new Error('Invalid region: ' + region);
			}
		};
	}
	/* in use by the query APIs */
	if (config.prefix === 'sqs') {
		/** Sets the path to hit a SQS queue
		 * Must be formatted as the full path
		 * @param queue
		 * @return config
		 */
		config.setQueue = function (queue) {
			queue = String(queue);
			if( queue.match(/\/[0-9]{12}\/.*\//) ){
				config.path = queue;
				return config;
			} else {
				throw new Error('Invalid queue path: ' + queue);
			}
		};
	}
	if (config.prefix != 's3') {
		/**
		 * Gets the defined API version
		 * @return string
		 */
		config.getApiVersion = function () {
			return config.query.Version;
		};
		/**
		 * Sets the query API version
		 * @param version
		 */
		config.setApiVersion = function (version) {
			version = String(version);
			if (version.match(/\d{4}-\d{2}-\d{2}/)) {
				config.query.Version = version;
				return config;
			} else {
				throw new Error('Invalid version specification for client.setApiVersion().');
			}
		};
		/**
		 * Sets the API remote HTTP path
		 * @param path
		 */
		config.setPath = function (path) {
			path = String(path);
			if ( ! path) {
				path = '/';
			}
			config.path = path;
			return config;
		};
		/**
		 * The "low level" call to the query APIs
		 * @param action
		 * @param query
		 * @param callback
		 */
		config.request = function (action, query, callback) {
			internals.checkConfig(config);
			if ( ! callback) {
				callback = query;
				query = {};
			}
			if (client.prefix != 'dynamodb') {
				query.Action = action;
				if (config.sessionToken) {
					query.SecurityToken = config.sessionToken;
				}
				query = tools.merge(config.query, query);
			}
			var now = new Date();
			var headers = {};
			if ( ! config.signHeader) {
				query = tools.merge(query, {
					Timestamp: now.toISOString(),
					AWSAccessKeyId: config.accessKeyId
				});
				query.Signature = internals.sign(config, query);
			} else {
				switch (config.prefix) {
					case 'email': // aka ses
						var prefix = 'AWS3-HTTPS';
						var signature = internals.createHmac(config.secretAccessKey, now.toUTCString(), 'sha256');
					break;
					case 'dynamodb':
						var prefix = 'AWS3';
						var clientHeaders = {
							'content-type': 'application/x-amz-json-1.0',
							'x-amz-target': 'DynamoDB_' + internals.squashApiVersion(config) + '.' + action,
							'x-amz-security-token': config.sessionToken
						};
						var clientBody = JSON.stringify(query);
						var responseBodyHandler = 'json';
						var signature = internals.signHeaders(config, clientHeaders, clientBody, now.toUTCString());
					break;
					default:
						throw new Error('The ' + String(config.prefix) + ' service is not supported for the signHeader signing method.');
					break;
				}
				headers = {
					host: config.host,
					date: now.toUTCString(),
					'x-amzn-authorization': prefix + ' AWSAccessKeyId=' + config.accessKeyId + ', Algorithm=HmacSHA256,' + 'Signature=' + signature
				};
			}
			if (config.prefix != 'dynamodb') {
				var clientHeaders = {
					'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
				};
				var clientBody = qs.stringify(query);
				var responseBodyHandler = 'xml';
			}
			internals.makeRequest(config, {
				method: 'POST',
				headers: tools.merge(headers, clientHeaders)
			}, clientBody, responseBodyHandler, callback);
		};
		config.call = function() {
			// This is deprecated due to ambiguity with Function.prototype.call.
			console.error('Warning: aws2js use of .call() is deprecated.  Use .request() instead.');
			return config.request.apply(this, arguments);
		};
	}
	/* in use by the S3 REST API */
	if (config.prefix == 's3') {
		/* the low level methods */
		/**
		 * Wraps the GET requests to the S3 API
		 * @param path
		 * @param handler
		 * @param callback
		 */
		config.get = function (path, handler, callback) {
			internals.checkConfig(config);
			path = internals.checkPath(path, callback);
			if ( ! path) {
				return;
			}
			internals.standardHeaders(config, 'GET', {}, path, function (err, headers) {
					if (err) {
						callback(err);
					} else {
						internals.makeRequest(config, {
							method: 'GET',
							path: path,
							headers: headers
						}, false, handler, callback)
					}
				}
			);
		};
		/**
		 * Wraps the HEAD requests to the S3 API
		 * @param path
		 * @param callback
		 */
		config.head = function (path, callback) {
			internals.checkConfig(config);
			path = internals.checkPath(path, callback);
			if ( ! path) {
				return;
			}
			internals.standardHeaders(config, 'HEAD', {}, path, function (err, headers) {
					if (err) {
						callback(err);
					} else {
						internals.makeRequest(config, {
							method: 'HEAD',
							path: path,
							headers: headers
						}, false, null, callback);
					}
				}
			);
		};
		/**
		 * Wraps the DELETE requests to the S3 API
		 * @param path
		 * @param callback
		 */
		config.del = function (path, callback) {
			internals.checkConfig(config);
			path = internals.checkPath(path, callback);
			if ( ! path) {
				return;
			}
			internals.standardHeaders(config, 'DELETE', {
					'content-length': 0
				}, path, function (err, headers) {
					if (err) {
						callback(err);
					} else {
						internals.makeRequest(config, {
							method: 'DELETE',
							path: path,
							headers: headers
						}, false, null, callback);
					}
				}
			);
		};
		/**
		 * Wraps the PUT requests to the S3 API
		 * @param path
		 * @param headers
		 * @param body
		 * @param callback
		 */
		config.put = function (path, headers, body, callback) {
			internals.checkConfig(config);
			path = internals.checkPath(path, callback);
			if ( ! path) {
				return;
			}
			if (body.file) {
				body.file = p.resolve(body.file);
			}
			if ( ! headers['content-length']) {
				headers = tools.merge(headers, {'content-length': 0});
			}
			internals.standardHeaders(config, 'PUT', headers, path, body, function (err, hdrs) {
					if (err) {
						callback(err);
					} else {
						internals.makeRequest(config, {
							method: 'PUT',
							path: path,
							headers: hdrs
						}, body, null, callback);
					}
				}
			);
		};
		/* the S3 helpers */
		/**
		 * Sets the bucket name
		 * @param bucket
		 */
		config.setBucket = function (bucket) {
			config = tools.merge(config, {
				host: bucket + '.' + config.prefix + cfg.suffix,
				useBucket: bucket
			});
			return config;
		};
		/**
		 * Sets the S3 endpoint
		 * @param endpoint
		 */
		config.setEndPoint = function (endpoint) {
			config.setBucket(endpoint);
			return config;
		};
		/**
		 * Creates a S3 bucket
		 * @param bucket
		 * @param acl
		 * @param region
		 * @param callback
		 */
		config.createBucket = function (bucket, acl, region, callback) {
			config.setBucket(bucket);
			var headers = {
				'x-amz-acl': 'private'
			};
			var body = false;
			headers = internals.checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			if (region) {
				if ( region in cfg.regions) {
					body = '<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><LocationConstraint>' + cfg.regions[region] + '</LocationConstraint></CreateBucketConfiguration>';
				} else {
					error = new Error('Invalid region: ' + region);
					callback(error);
					return;
				}
			}
			config.put('/', headers, body, callback);
		};
		/**
		 * Sets the canned ACLs for an existing bucket
		 * @param bucket
		 * @param acl
		 * @param callback
		 */
		config.setBucketAcl = function (bucket, acl, callback) {
			config.setBucket(bucket);
			var headers = {
				'x-amz-acl': 'private'
			};
			headers = internals.checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			config.put('/?acl', headers, false, callback);
		};
		/**
		 * Puts a file to S3
		 * @param path
		 * @param file
		 * @param acl
		 * @param headers
		 * @param callback
		 */
		config.putFile = function (path, file, acl, headers, callback) {
			file = p.resolve(file);
			headers = internals.normalizeHeaders(headers);
			headers = internals.checkAcl(acl, headers, callback);
			headers.expect = '100-continue';
			if ( ! headers) {
				return;
			}
			var md5 = crypto.createHash('md5');
			var bf = fs.ReadStream(file);
			bf.on('data', function (chunk) {
				md5.update(chunk);
			});
			bf.on('end', function () {
				headers['content-md5'] = md5.digest('base64');
				config.put(path, headers, {
					file: file
				}, callback);
			});
			bf.on('error', function (error) {
				callback(error);
			});
		};
		config.putObject = function () {
			// This is deprecated due to ambiguity when using a file path vs. a string which happens to contain a valid file path
			console.error('Warning: aws2js/S3 use of .putObject() is deprecated.  Use .putFile() instead.');
			return config.putFile.apply(this, arguments);
		};
		/**
		 * Puts a Stream to S3
		 * @param path
		 * @param stream
		 * @param acl
		 * @param headers
		 * @param callback
		 */
		config.putStream = function (path, stream, acl, headers, callback) {
			headers = internals.normalizeHeaders(headers);
			headers = internals.checkAcl(acl, headers, callback);
			headers.expect = '100-continue';
			if ( ! headers) {
				return;
			}
			config.put(path, headers, stream, callback);
		};
		/**
		 * Puts a Buffer to S3
		 * @param path
		 * @param stream
		 * @param acl
		 * @param headers
		 * @param callback
		 */
		config.putBuffer = function (path, buffer, acl, headers, callback) {
			headers = internals.normalizeHeaders(headers);
			headers = internals.checkAcl(acl, headers, callback);
			headers.expect = '100-continue';
			if ( ! headers) {
				return;
			}
			if ( ! headers['content-md5']) {
				var md5 = crypto.createHash('md5');
				md5.update(buffer);
				headers['content-md5'] = md5.digest('base64');
			}
			config.put(path, headers, buffer, callback);
		};
		/**
		 * Sets the object canned ACLs
		 * @param path
		 * @param acl
		 * @param callback
		 */
		config.setObjectAcl = function (path, acl, callback) {
			var headers = {
				'x-amz-acl': 'private'
			};
			headers = internals.checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			config.put(path + '?acl', headers, false, callback);
		};
		/**
		 * Sets the object meta-data
		 * @param path
		 * @param acl
		 * @param headers
		 * @param callback
		 */
		config.setObjectMeta = function (path, acl, headers, callback) {
			headers = internals.normalizeHeaders(headers);
			headers = internals.checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			headers['x-amz-copy-source'] = '/' + config.useBucket + path;
			headers['x-amz-metadata-directive'] = 'REPLACE';
			config.head(path, function (error, response) {
				if (error) {
					callback(error);
				} else {
					headers['content-type'] = response['content-type'];
					config.put(path, headers, false, callback);
				}
			});
		};
		/**
		 * Renames an object
		 * @param source
		 * @param target
		 * @param acl
		 * @param callback
		 */
		config.renameObject = function (source, target, acl, callback) {
			headers = {};
			headers = internals.checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			headers['x-amz-copy-source'] = '/' + config.useBucket + source;
			headers['x-amz-metadata-directive'] = 'REPLACE';
			config.head(source, function (error, response) {
				if (error) {
					callback(error);
				} else {
					headers['content-type'] = response['content-type'];
					if (response['cache-control']) {
						headers['cache-control'] = response['cache-control'];
					}
					config.put(target, headers, false, function (error, response) {
						if (error) {
							callback(error);
						} else {
							config.del(source, callback);
						}
					});
				}
			});
		};
		/**
		 * Exposes the escapePath() helper
		 * @param path
		 * @return string
		 */
		config.escapePath = tools.escapePath;
	}
	return config;
};
/**
 * The AWS API client loader
 * @param service
 * @param accessKeyId
 * @param secretAccessKey
 */
exports.load = function (service, accessKeyId, secretAccessKey, sessionToken) {
	var clientTemplate = cfg.clients[service];
	if ( ! clientTemplate) {
		throw new Error('Invalid AWS client');
	}
	if (service != 's3') {
		clientTemplate.path = '/';
	}
	var clientConfig = {};
	for (var key in clientTemplate) {
		clientConfig[key] = clientTemplate[key];
	}
	var result = client(clientConfig);
	if (accessKeyId && secretAccessKey) {
		result.setCredentials(accessKeyId, secretAccessKey, sessionToken);
	}
	return result;
};
