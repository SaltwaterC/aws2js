// add the submodules here
exports.EC2 = require('./ec2.js');

// TODO: reimplement the library loader for the legacy interface
exports.load = function(service, accessKeyId, secretAccessKey, sessionToken, httpOptions) {
	// TODO: deprecate this method
	// TODO: implement httpOptions support in http-request
};
