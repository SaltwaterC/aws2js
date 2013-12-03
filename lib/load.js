'use strict';

// add the submodules here
exports.EC2 = require('./ec2.js');

/*jslint todo:true*/ // XXX

// map the legacy service names
var map = {
	'ec2': 'EC2'
};

exports.load = function(service, accessKeyId, secretAccessKey, sessionToken, httpOptions) {
	// TODO: implement httpOptions support in http-request
	console.error('Warning: the library loader of aws2js is deprecated. Use the exported constructors for each service instead. See the examples from README.md.');

	if (exports[map[service]]) {
		var svc = new exports[map[service]](accessKeyId, secretAccessKey);

		if (sessionToken) {
			svc.setSessionToken(sessionToken);
		}

		if (httpOptions) {
			svc.setHttpOptions(httpOptions);
		}

		return svc;
	}

	throw new Error('Invalid AWS client.');
};
