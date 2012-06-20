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
var client = function (config, httpOptions) {
	// adds the default host
	if ( ! config.host) {
		config.host = config.prefix + cfg.suffix;
	}
	
	/* globally accessible */
	
	/**
 	 * Helper for stopping httpOptions getting polluted
 	 */
	config.cloneHttpOptions = function() {
		var result = {};
		for (var key in httpOptions) {
			result[key] = httpOptions[key];
		}
		return result;
	};
	
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
		// easier than messing with the Agent instance
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
	
	/* SQS client API */
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
						// unescapes the UTF-8 chars, see #30
						clientBody = unescape(clientBody.replace(/\\u/g, '%u'));
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
			var options = config.cloneHttpOptions();
			options.method = 'POST';
			options.headers = tools.merge(headers, clientHeaders);
			internals.makeRequest(config, options, clientBody, responseBodyHandler, callback);
		};
		
		// deprecated method, will be removed in v1.0
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
		 * @param query
		 * @param handler
		 * @param callback
		 */
		config.get = function (path, query, handler, callback) {
			if ( ! callback) {
				callback = handler;
				handler = query;
				query = {};
			}
			internals.checkConfig(config);
			path = internals.checkPath(path, callback, query);
			if ( ! path) {
				return;
			}
			internals.standardHeaders(config, 'GET', {}, path, function (err, headers) {
					if (err) {
						callback(err);
					} else {
						var options = config.cloneHttpOptions();
						options.method = 'GET';
						options.path = path;
						options.headers = headers;
						internals.makeRequest(config, options, false, handler, callback)
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
						var options = config.cloneHttpOptions();
						options.method = 'HEAD';
						options.path = path;
						options.headers = headers;
						internals.makeRequest(config, options, false, null, callback);
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
						var options = config.cloneHttpOptions();
						options.method = 'DELETE';
						options.path = path;
						options.headers = headers;
						internals.makeRequest(config, options, false, null, callback);
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
			if (body && body.file) {
				body.file = p.resolve(body.file);
			}
			if ( ! headers['content-length']) {
				headers = tools.merge(headers, {'content-length': 0});
			}
			internals.standardHeaders(config, 'PUT', headers, path, body, function (err, hdrs) {
					if (err) {
						callback(err);
					} else {
						var options = config.cloneHttpOptions();
						options.method = 'PUT';
						options.path = path;
						options.headers = hdrs;
						internals.makeRequest(config, options, body, null, callback);
					}
				}
			);
		};
		
		/**
		 * Wraps the POST requests to the S3 API
		 * @param path
		 * @param headers
		 * @param body
		 * @param callback
		 */
		config.post = function (path, headers, body, callback) {
			internals.checkConfig(config);
			path = internals.checkPath(path, callback);
			if ( ! path) {
				return;
			}
			if (body.file) {
				body.file = p.resolve(body.file);
			}
			internals.standardHeaders(config, 'POST', headers, path, body, function (err, hdrs) {
					if (err) {
						callback(err);
					} else {
						hdrs.expect = '100-continue';
						var options = config.cloneHttpOptions();
						options.method = 'POST';
						options.path = path;
						options.headers = hdrs;
						internals.makeRequest(config, options, body, 'xml', callback);
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
			return config.setBucket(endpoint);
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
			if ( ! headers) {
				return;
			}
			headers.expect = '100-continue';
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

      /**
       * Copy a File from one s3 path to another
       *
       * ported from http://s3tools.org/s3cmd
       *
       * @param string source
       * @param string destination
       * @param acl
       * @param headers
       * @param callback
       * @link http://docs.amazonwebservices.com/AmazonS3/latest/API/RESTObjectCOPY.html
       * @link http://s3tools.org/s3cmd
       */
      config.copyFile = function (src, dst, acl, headers, callback) {
			headers = internals.normalizeHeaders(headers);
         headers['x-amz-copy-source'] = src; 
         headers['x-amz-metadata-directive'] = 'COPY';
         config.put(dst, headers, null, callback);
         //internals.makeRequest();
      };
		
		// deprecated method, will be removed in v1.0
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
			if ( ! headers) {
				return;
			}
			headers.expect = '100-continue';
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
			if ( ! headers) {
				return;
			}
			headers.expect = '100-continue';
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
         * Get the bucket lifecycle configuration.
         * Returns a 400 error if the bucket has no
         * lifecycle configuration (S3 behaviour).
         * @param callback
         */
        config.getLifeCycle = function (callback)  {
            internals.checkConfig(config);
            config.get('?lifecycle', 'xml', callback);
        };
		
        /**
         * Delete the bucket lifecycle configuration
         * @param callback
         */
        config.delLifeCycle = function (callback) {
            internals.checkConfig(config);
            config.del('?lifecycle', callback);
        };
		
        /**
         * Add a lifecycle rule to the bucket
         * lifecycle configuration
         * @param id
         * @param prefix
         * @param expireInDays
         * @param callback
         */
        config.putLifeCycleRule = function (id, prefix, expireInDays, callback) {
            internals.checkConfig(config);
			
            // allow this method to have type number for expireInDays parameter
            expireInDays = expireInDays + '';
			
            // first retrieve existing rules
            config.getLifeCycle(function (error, response) {
                if (error) {
                    if (error.document && error.document.Code == 'NoSuchLifecycleConfiguration') {
                        // the bucket hasn't a lifecycle configuration, we need to create it
                        response = {Rule: []};
                    } else {
                        callback(error);
                        return;
                    }
                }
				
                // the bucket has a lifecycle configuration, we need to update it.
                // check if the rule for the specified id already exists
                var found = internals.findLifeCycleRule(id, response);
                if (found) {
                    // the rule exists, update it
                    var rule = found.rule;
                    rule.Prefix = prefix;
                    rule.Expiration.Days = expireInDays;
                } else {
                    // if not exists, create and add the new desired rule
                    response.Rule.push({
                        ID: id,
                        Prefix: prefix,
                        Status: 'Enabled',
                        Expiration: {
							Days: expireInDays
						}
                    });
                }
				
                // now put the new lifecycle configuration
                internals.putLifeCycleConfig(config, response, callback);
            });
        };
		
        /**
         * Deletes a specific rule
         * Returns an error if the bucket hasn't lifecycle
         * config or if the rule is not found.
         * @param id
         * @param callback
         */
        config.delLifeCycleRule = function (id, callback) {
            internals.checkConfig(config);
			
            // first retrieve existing rules
            config.getLifeCycle(function (error, response) {
                if (error) {
                    // no rule to delete, error
                    callback(error);
					return;
                }
				
                var found = internals.findLifeCycleRule(id, response);
                if (found) {
                    // the rule exists
                    if (response.Rule.length == 1) {
                        // this is the only Rule of the lifecycle config
                        // because S3 doesn't accept empty lifecycle config,
                        // we must use the global delete
                        config.delLifeCycle(callback);
                        return;
                    }
                    // remove the rule
                    response.Rule.splice(found.index, 1);
                }
				
                // now put the new lifecycle configuration
                internals.putLifeCycleConfig(config, response, callback);
            });
        };
		
		/**
		 * Initiates a multipart upload
		 * @param path
		 * @param acl
		 * @param headers
		 * @param callback
		 */
		config.initUpload = function (path, acl, headers, callback) {
			headers = internals.normalizeHeaders(headers);
			headers = internals.checkAcl(acl, headers, callback);
			if ( ! headers) {
				return;
			}
			config.post(path + '?uploads', headers, '', function (err, res) {
				if (err) {
					callback(err);
				} else {
					callback(null, {bucket: res.Bucket, key: res.Key, uploadId: res.UploadId});
				}
			});
		};
		/**
		 * Aborts a multipart upload
		 * @param path
		 * @param uploadId
		 * @param callback
		 */
		config.abortUpload = function (path, uploadId, callback) {
			config.del(path + '?uploadId=' + uploadId, callback);
		};
		/**
		 * Completes a multipart upload
		 * @param path
		 * @param uploadId
		 * @param uploadParts
		 * @param callback
		 */
		config.completeUpload = function (path, uploadId, uploadParts, callback) {
			var xml = '<CompleteMultipartUpload>';
			for (var i in uploadParts) {
				xml += '<Part><PartNumber>' + i + '</PartNumber><ETag>' + uploadParts[i] + '</ETag></Part>';
			}
			xml += '</CompleteMultipartUpload>';
			config.post(path + '?uploadId=' + uploadId, {}, xml, callback);
		};
		/**
		 * Uploades a file part of a multipart upload
		 * @param path
		 * @param partNumber
		 * @param uploadId
		 * @param fileHandler
		 * @param callback
		 */
		config.putFilePart = function (path, partNumber, uploadId, fileHandler, callback) {
			fileHandler.file = p.resolve(fileHandler.file);
			fileHandler.options = internals.filterByteRange(fileHandler.options, false, callback);
			if ( ! fileHandler.options) {
				return;
			}
			var md5 = crypto.createHash('md5');
			var bf = fs.ReadStream(fileHandler.file, fileHandler.options);
			bf.on('data', function (chunk) {
				md5.update(chunk);
			});
			bf.on('end', function () {
				var headers = {expect: '100-continue'};
				headers['content-md5'] = md5.digest('base64');
				config.put(path + '?partNumber=' + partNumber + '&uploadId=' + uploadId, headers, fileHandler, function (err, res) {
					if (err) {
						err.partNumber = partNumber;
						callback(err);
					} else {
						callback(null, {
							partNumber: partNumber,
							ETag: res.etag
						});
					}
				});
			});
			bf.on('error', function (error) {
				callback(error);
			});
		};
		/**
		 * Uploades a stream part of a multipart upload
		 * @param path
		 * @param partNumber
		 * @param uploadId
		 * @param stream
		 * @param headers
		 * @param callback
		 */
		config.putStreamPart = function (path, partNumber, uploadId, stream, headers, callback) {
			headers.expect = '100-continue';
			config.put(path + '?partNumber=' + partNumber + '&uploadId=' + uploadId, headers, stream, function (err, res) {
				if (err) {
					err.partNumber = partNumber;
					callback(err);
				} else {
					callback(null, {
						partNumber: partNumber,
						ETag: res.etag
					});
				}
			});
		};
		/**
		 * Uploades a buffer part of a multipart upload
		 * @param path
		 * @param partNumber
		 * @param uploadId
		 * @param buffer
		 * @param callback
		 */
		config.putBufferPart = function (path, partNumber, uploadId, buffer, callback) {
			var headers = {expect: '100-continue'};
			var md5 = crypto.createHash('md5');
			md5.update(buffer);
			headers['content-md5'] = md5.digest('base64');
			config.put(path + '?partNumber=' + partNumber + '&uploadId=' + uploadId, headers, buffer, function (err, res) {
				if (err) {
					err.partNumber = partNumber;
					callback(err);
				} else {
					callback(null, {
						partNumber: partNumber,
						ETag: res.etag
					});
				}
			});
		};
		/**
		 * Uploads a file by using the S3 multipart upload API
		 * @param path
		 * @param file
		 * @param acl
		 * @param headers
		 * @param partSize
		 * @param callback
		 */
		config.putFileMultipart = function (path, file, acl, headers, partSize, callback) {
			if ( ! callback) {
				callback = partSize;
				partSize = 5242880;
			} else {
				partSize = Number(partSize);
				if (partSize < 5242880 || isNaN(partSize)) {
					partSize = 5242880;
				}
			}
			file = p.resolve(file);
			fs.stat(file, function (err, res) {
				if (err) {
					callback(err);
				} else {
					var size = res.size;
					if (size <= 5242880) { // fallback to s3.putFile()
						config.putFile(path, file, acl, headers, callback);
					} else { // multipart upload
						config.initUpload(path, acl, headers, function (err, res) {
							if (err) {
								callback(err);
							} else {
								var uploadId = res.uploadId;
								var count = Math.ceil(size / partSize);
								var errors = [];
								var aborted = false;
								var uploadParts = [];
								var finished = 0;
								var putFilePart = function (path, partNumber, uploadId, fileHandler, callback) {
									if ( ! aborted) {
										config.putFilePart(path, partNumber, uploadId, fileHandler, function (err, res) {
											if ( ! aborted) {
												if (err) {
													errors[partNumber]++;
													if (errors[partNumber] == 10) {
														aborted = true;
														config.abortUpload(path, uploadId, function (err, res) {
															if ( ! err) {
																err = new Error('Part ' + partNumber + ' failed the upload 10 times. Aborting the multipart upload.');
																err.partNumber = partNumber;
															} else {
																err.partNumber = partNumber;
															}
															callback(err);
														});
													} else {
														setTimeout(function () {
															putFilePart(path, partNumber, uploadId, fileHandler, callback);
														}, 500 * errors[partNumber]);
													}
												} else {
													uploadParts[res.partNumber] = res.ETag;
													finished++;
													if (finished == count) {
														config.completeUpload(path, uploadId, uploadParts, callback);
													}
												}
											}
										});
									}
								};
								for (var partNumber = 1; partNumber <= count; partNumber++) {
									errors[partNumber] = 0;
									putFilePart(path, partNumber, uploadId, {
										file: file,
										options: {
											start: (partNumber - 1) * partSize,
											end: partNumber * partSize - 1
										}
									}, callback);
								}
							}
						});
					}
				}
			});
		};
		/**
		 * Exposes the deprecated escapePath() helper
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
 * @param sessionToken
 * @param httpOptions
 */
exports.load = function (service, accessKeyId, secretAccessKey, sessionToken, httpOptions) {
	if (service == 's3') {
		if (process.version == 'v0.6.9') { // npm doesn't like version ranges, the parser is FUBAR
			throw new Error('FATAL: The S3 client is NOT supported under node.js v0.6.9.');
			process.exit(1);
		}
	}
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
	var result = client(clientConfig, httpOptions || {});
	if (accessKeyId && secretAccessKey) {
		result.setCredentials(accessKeyId, secretAccessKey, sessionToken);
	}
	return result;
};
