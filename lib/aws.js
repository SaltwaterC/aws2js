var https = require('https');
var crypto = require('crypto');
var xml2js = require('xml2js');
var qs = require('querystring');

var regions = {
	'us-east-1': '',
	'us-west-1': '',
	'eu-west-1': '',
	'ap-southeast-1': '',
	'ap-northeast-1': ''
};

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

var client = function (config) {
	var suffix = '.amazonaws.com';
	
	if ( ! config.host) {
		config.host = config.prefix + suffix;
	}
	
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
		
		return crypto.createHmac('sha256', config.secretAccessKey).update(toSign).digest('base64');
	};
	
	config.setRegion = function (region) {
		if (region in regions) {
			config.host = config.prefix + '.' + region + suffix;
		} else {
			throw new Error('Invalid region: ' + region);
		}
	};
	
	config.init = function (cfg) {
		config = merge(config, cfg);
	};
	
	config.call = function (action, query, callback) {
		if ( ! config.accessKeyId || ! config.secretAccessKey) {
			throw new Error('You must set the AWS credentials: accessKeyId + secretAccessKey');
		}
		
		query = merge(query, config.query);
		query = merge(query, {
			Action: action,
			Timestamp: new Date().toISOString(),
			AWSAccessKeyId: config.accessKeyId
		});
		query.Signature = sign(query);
		
		var body = qs.stringify(query);
		
		var options = {
			host: config.host,
			path: config.path,
			method: 'POST',
			headers: {
				Host: config.host,
				"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
				"Content-Length": body.length
			}
		};
		
		var request = https.request(options, function (response) {
			var data = '';
			
			response.on('data', function (chunk) {
				data += chunk;
			});
			
			response.on('end', function () {
				var parser = new xml2js.Parser();
				
				parser.on('error', function (error) {
					callback(error, {});
				});
				
				parser.on('end', function (result) {
					var error;
					
					if (response.statusCode != 200) {
						var message = 'The API returned an unknown error; HTTP Code: ' + response.statusCode;
						
						if (result.Errors) {
							if (result.Errors.Error) {
								if (result.Errors.Error.Message) {
									message = result.Errors.Error.Message;
								}
							}
						}
						
						error = new Error(message);
						error.code = response.statusCode;
					}
					
					callback(error, result);
				});
				
				parser.parseString(data);
			});
			
		});
		
		request.on('error', function (error) {
			callback(error, {});
		});
		
		request.write(body);
		request.end();
	};
	
	return config;
};

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

