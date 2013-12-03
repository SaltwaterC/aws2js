## About

Amazon Web Services node.js client.

 * [Changelog](https://github.com/SaltwaterC/aws2js/blob/master/doc/CHANGELOG.md)
 * [License](https://github.com/SaltwaterC/aws2js/blob/master/doc/LICENSE.md)

## Installation

> npm install aws2js

## Project and Design goals

 * HTTPS-only APIs communication (exceptions allowed for HTTP-only APIs)
 * Proper error reporting
 * Simple to write clients for a specific AWS service (abstracts most of the low level plumbing)
 * Simple to use AWS API calls
 * Higher level clients for specific work flows
 * Proper documentation

## Supported Amazon Web Services

 * [Amazon EC2](https://github.com/SaltwaterC/aws2js/wiki/EC2-Client) (Elastic Compute Cloud)
 * [Amazon RDS](https://github.com/SaltwaterC/aws2js/wiki/RDS-Client) (Relational Database Service)
 * [Amazon SES](https://github.com/SaltwaterC/aws2js/wiki/SES-Client) (Simple Email Service)
 * [Amazon ELB](https://github.com/SaltwaterC/aws2js/wiki/ELB-Client) (Elastic Load Balancing)
 * [Amazon IAM](https://github.com/SaltwaterC/aws2js/wiki/IAM-Client) (Identity and Access Management)
 * [Amazon Auto Scaling](https://github.com/SaltwaterC/aws2js/wiki/Auto-Scaling-Client)
 * [Amazon CloudWatch](https://github.com/SaltwaterC/aws2js/wiki/CloudWatch-Client)
 * [Amazon ElastiCache](https://github.com/SaltwaterC/aws2js/wiki/ElastiCache-Client)
 * [Amazon SQS](https://github.com/SaltwaterC/aws2js/wiki/SQS-Client) (Simple Queue Service)
 * [Amazon CloudFormation](https://github.com/SaltwaterC/aws2js/wiki/CloudFormation-Client)
 * [Amazon SDB](https://github.com/SaltwaterC/aws2js/wiki/SDB-Client) (SimpleDB)
 * [Amazon STS](https://github.com/SaltwaterC/aws2js/wiki/STS-Client) (Security Token Service)
 * [Amazon DynamoDB](https://github.com/SaltwaterC/aws2js/wiki/DynamoDB-Client)
 * [Amazon SNS](https://github.com/SaltwaterC/aws2js/wiki/SNS-Client) (Simple Notification Service)
 * [Amazon EMR](https://github.com/SaltwaterC/aws2js/wiki/EMR-Client) (Elastic MapReduce)
 * [Amazon S3](https://github.com/SaltwaterC/aws2js/wiki/S3-Client) (Simple Storage Service)

## Examples

```javascript
var EC2 = require('aws2js').EC2;
var ec2 = new EC2('accessKeyId', 'secretAccessKey');

ec2.request('DescribeInstances', function (error, result) {
	if (error) {
		console.error(error);
		return;
	}
	
	console.log(results);
});
```
