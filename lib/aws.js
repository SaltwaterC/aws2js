var https = require('https');
var crypto = require('crypto');
var parser = require('libxml-to-js').stringParser;
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
	
	var hmacSha256 = function (toSign) {
		return crypto.createHmac('sha256', config.secretAccessKey).update(toSign).digest('base64');
	};
	
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
		
		return hmacSha256(toSign);
	};
	
	config.setCredentials = function (accessKeyId, secretAccessKey) {
		config = merge(config, {
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey
		});
	};
	
	config.setRegion = function (region) {
		if (region in regions) {
			config.host = config.prefix + '.' + region + suffix;
		} else {
			throw new Error('Invalid region: ' + region);
		}
	};
	
	config.config = function (cfg) {
		config = merge(config, cfg);
	};
	
	config.call = function (action, query, callback) {
		if ( ! config.accessKeyId || ! config.secretAccessKey) {
			throw new Error('You must set the AWS credentials: accessKeyId + secretAccessKey');
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
				Date: now.toUTCString(),
				'x-amzn-authorization': 'AWS3-HTTPS AWSAccessKeyId=' +
					config.accessKeyId + ', Algorithm=HmacSHA256, ' +
					'Signature=' + hmacSha256(now.toUTCString())
			};
		}
		
		var body = qs.stringify(query);
		
		var options = {
			host: config.host,
			path: config.path,
			method: 'POST',
			headers: merge(headers, {
				Host: config.host,
				"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
				"Content-Length": body.length
			})
		};
				
		var request = https.request(options, function (response) {
			var xml = '';
			
			response.on('data', function (chunk) {
				xml += chunk;
			});
			
			response.on('end', function () {
				parser(xml, function (error, result) {
					if (response.statusCode != 200) {
						error = new Error('API error with HTTP Code: ' + response.statusCode);
					}
					callback(error, result);
				});
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

exports.ses = client({
	prefix: 'email',
	host: 'email.us-east-1.amazonaws.com',
	path: '/',
	signHeader: true
});
