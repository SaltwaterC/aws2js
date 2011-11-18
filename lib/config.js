/**
 * Common suffix for the API endpoints
 */
exports.suffix = '.amazonaws.com';
/**
 * The supported regions. The values patch the SNAFU of the S3 API.
 */
exports.regions = {
	'us-east-1': '', // Virginia
	'us-west-1': 'us-west-1', // N. California
	'us-west-2': 'us-west-2', // Oregon
	'eu-west-1': 'EU', // Ireland
	'ap-southeast-1': 'ap-southeast-1', // Singapore
	'ap-northeast-1': 'ap-northeast-1' // Tokyo
};
/**
 * Services without region support and default endpoints
 */
exports.noRegion = {
	s3: null, // S3 sets the region per bucket when the bucket is created
	email: null,
	iam: null,
	elasticache: null
};
/**
 * Canned ACLs
 */
exports.cannedAcls = {
	'private' : null,
	'public-read' : null,
	'public-read-write' : null,
	'authenticated-read' : null,
	'bucket-owner-read' : null,
	'bucket-owner-full-control' : null
};
/**
 * The actual clients with the default config. Loaded on demand by aws.js's load() method.
 */
exports.clients = {
	ec2: {
		prefix: 'ec2',
		path: '/',
	    query: {
	    	Version: '2011-07-15',
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
			Version: '2011-08-15',
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
			Version: '2011-01-01',
			SignatureMethod: 'HmacSHA256',
			SignatureVersion: '2'
		}
	},
	cloudwatch: {
		prefix: 'monitoring',
		path: '/',
		query: {
			Version: '2010-08-01',
			SignatureMethod: 'HmacSHA256',
			SignatureVersion: '2'
		}
	},
	elasticache: {
		prefix: 'elasticache',
		host: 'elasticache.us-east-1.amazonaws.com',
		path: '/',
		query: {
			Version: '2011-07-15',
			SignatureMethod: 'HmacSHA256',
			SignatureVersion: '2'
		}
	},
	sqs: {
		prefix: 'sqs',
		path: '/',
		query: {
			Version: '2011-10-01',
			SignatureMethod: 'HmacSHA256',
			SignatureVersion: '2'
		}
	}
};
