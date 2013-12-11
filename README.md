## About ![build status](https://secure.travis-ci.org/SaltwaterC/aws2js.png?branch=next)

Amazon Web Services node.js client.

 * [Changelog](https://github.com/SaltwaterC/aws2js/blob/master/doc/CHANGELOG.md)
 * [License](https://github.com/SaltwaterC/aws2js/blob/master/doc/LICENSE.md)

## Installation

> npm install aws2js

## Migrating from pre 0.9

The library loader from aws2js up to 0.9 is deprecated. Creating a new instance for each service is the preffered way. Creating a new client without specifying the AWS credentials is not allowed, therefore the loader doesn't support this style anymore:

```javascript
var ec2 = require('aws2js').load('ec2');
ec2.setCredentials('AKIAccessKeyId', 'SecretAccessKey');
```

You have to add the credentials to the load call even for the deprecated mode:

```javascript
var ec2 = require('aws2js').load('ec2', 'AKIAccessKeyId', 'SecretAccessKey');
```

The presence of the AWS credentials is now checked when the client is instantiated instead of checking that with each AWS request. It is the right thing to do at the cost of backward incompatibility.

## Project and Design goals

 * HTTPS-only APIs communication (exceptions allowed for HTTP-only APIs)
 * Proper error reporting
 * Simple to write clients for a specific AWS service (abstracts most of the low level plumbing)
 * Modular design
 * Simple to use AWS API calls
 * Higher level clients for specific work flows
 * Proper documentation

## Supported Amazon Web Services

 * [EC2](https://github.com/SaltwaterC/aws2js/wiki/EC2-Client) (Elastic Compute Cloud)
 * [RDS](https://github.com/SaltwaterC/aws2js/wiki/RDS-Client) (Relational Database Service)
 * [SES](https://github.com/SaltwaterC/aws2js/wiki/SES-Client) (Simple Email Service)
 * [ELB](https://github.com/SaltwaterC/aws2js/wiki/ELB-Client) (Elastic Load Balancing)
 * [IAM](https://github.com/SaltwaterC/aws2js/wiki/IAM-Client) (Identity and Access Management)
 * [AS](https://github.com/SaltwaterC/aws2js/wiki/AS-Client) (Auto Scaling)
 * [CW](https://github.com/SaltwaterC/aws2js/wiki/CW-Client) (CloudWatch)
 * [EC](https://github.com/SaltwaterC/aws2js/wiki/EC-Client) (ElastiCache)
 * [SQS](https://github.com/SaltwaterC/aws2js/wiki/SQS-Client) (Simple Queue Service)
 * [CFN](https://github.com/SaltwaterC/aws2js/wiki/CFN-Client) (CloudFormation)
 * [SDB](https://github.com/SaltwaterC/aws2js/wiki/SDB-Client) (SimpleDB)
 * [STS](https://github.com/SaltwaterC/aws2js/wiki/STS-Client) (Security Token Service)
 * [DDB](https://github.com/SaltwaterC/aws2js/wiki/DDB-Client) (DynamoDB)
 * [SNS](https://github.com/SaltwaterC/aws2js/wiki/SNS-Client) (Simple Notification Service)
 * [EMR](https://github.com/SaltwaterC/aws2js/wiki/EMR-Client) (Elastic MapReduce)
 * [S3](https://github.com/SaltwaterC/aws2js/wiki/S3-Client) (Simple Storage Service)

## Examples

```javascript
var aws = require('aws2js');

var EC2 = aws.EC2;
var ec2 = new EC2('accessKeyId', 'secretAccessKey'); // Elastic Compute Cloud

ec2.request('DescribeInstances', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var RDS = aws.RDS;
var rds = new RDS('accessKeyId', 'secretAccessKey'); // Relational Database Service

rds.request('DescribeDBInstances', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var SES = aws.SES;
var ses = new SES('accessKeyId', 'secretAccessKey'); // Simple Email Service

ses.request('ListVerifiedEmailAddresses', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var ELB = aws.ELB;
var elb = new ELB('accessKeyId', 'secretAccessKey'); // Elastic Load Balancing

ses.request('DescribeLoadBalancers', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var IAM = aws.IAM;
var iam = new IAM('accessKeyId', 'secretAccessKey'); // Identity and Access Management

iam.request('ListUsers', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var AS = aws.AS;
var as = new AS('accessKeyId', 'secretAccessKey'); // Auto Scaling

as.request('DescribeScalingActivities', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var CW = aws.CW;
var cw = new CW('accessKeyId', 'secretAccessKey'); // CloudWatch

cw.request('DescribeAlarms', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var EC = aws.EC;
var ec = new EC('accessKeyId', 'secretAccessKey'); // ElastiCache

ec.request('DescribeCacheClusters', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var SQS = aws.SQS;
var sqs = new SQS('accessKeyId', 'secretAccessKey'); // Simple Queue Service

sqs.request('ListQueues', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var CFN = aws.CFN;
var cfn = new CFN('accessKeyId', 'secretAccessKey'); // CloudFormation

cfn.request('DescribeStacks', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var SDB = aws.SDB;
var sdb = new SDB('accessKeyId', 'secretAccessKey'); // SimpleDB

sdb.request('ListDomains', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var STS = aws.sts;
var sts = new STS('accessKeyId', 'secretAccessKey'); // Security Token Service

sts.request('GetSessionToken', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	var credentials = result.GetSessionTokenResult.Credentials;
	
	var DDB = aws.DDB;
	var ddb = new DDB(credentials.AccessKeyId, credentials.SecretAccessKey, credentials.SessionToken); // DynamoDB
	ddb.request('ListTables', function (err, res) {
		if (err) {
			console.error(err);
			return;
		}
		
		console.log(res);
	});
});

var SNS = aws.SNS;
var sns = new SNS('accessKeyId', 'secretAccessKey'); // Simple Notification Service

sns.request('ListSubscriptions', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});

var EMR = aws.EMR;
var emr = new EMR('accessKeyId', 'secretAccessKey'); // Elastic MapReduce

emr.request('DescribeJobFlows', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(result);
});
```
