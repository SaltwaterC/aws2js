## About

Amazon Web Services node.js module. Currently under development. This is basically a fork of aws-lib ( https://github.com/livelycode/aws-lib/ ) which served as most of the inspiration for this module. While it resembles its original structure, some of the internal workings are changed due to obvious reasons. Currently it uses my patched xml2js fork ( https://github.com/SaltwaterC/node-xml2js ) that includes error reporting for broken XML responses. Hopefully the patch will be merged into the upstream as I already sent a pull request.

## Design goals

 * HTTPS-only API communication
 * Proper error reporting
 * Simple to write clients for a specific AWS service
 * Simple to use AWS API calls

For example, the EC2 client is:
<pre>
exports.ec2 = client({
	prefix: 'ec2',
	path: '/',
    query: {
    	Version: '2011-05-15',
    	SignatureMethod: 'HmacSHA256',
	SignatureVersion: '2'
    }
});
</pre>

Abstracting most of the AWS APIs plumbing is the actual goal behind the client simplicity.

## Supported services

 * EC2 (require('./aws-js').ec2)
 * RDS (require('./aws-js').rds)

More will come. Remember, this is under active development, but an early release. I still need S3 support (at least) for my own usage. I'll publish it to the npm registry when it is going to be polished enough to be generally available.

## Usage mode
<pre>
var ec2 = require('./aws-js').ec2;

ec2.init({ // Mandatory
	accessKeyId: 'your-acces-key-id',
	secretAccessKey: 'your-secret-access-key'
});

ec2.setRegion('eu-east-1'); // Optional. This is the default API entry point

// action, query, callback - for the action and query parameters, check the EC2 API reference
ec2.call('DescribeVolumes', {}, function (error, response) {
	if ( ! error) {
		for (var i in response.volumeSet.item) {
			console.log(response.volumeSet.item[i]);
		}
	} else {
		console.error(error);
	}
});
</pre>
