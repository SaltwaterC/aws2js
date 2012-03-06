## About ![still maintained](http://stillmaintained.com/SaltwaterC/aws2js.png)

Amazon Web Services node.js module. Originally a fork of [aws-lib](https://github.com/livelycode/aws-lib/).

## Installation

Either manually clone this repository into your node_modules directory, or the recommended method:

> npm install aws2js

## Project and Design goals

 * HTTPS-only APIs communication (exceptions allowed for HTTP-only APIs)
 * Proper error reporting
 * Simple to write clients for a specific AWS service (abstracts most of the low level plumbing)
 * Simple to use AWS API calls
 * Higher level clients for specific work flows
 * Proper documentation

## Supported

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
 * [Amazon S3](https://github.com/SaltwaterC/aws2js/wiki/S3-Client) (Simple Storage Service)

## Contributors

 * [Dan Tillberg](https://github.com/tillberg) - deprecation of [query.call()](https://github.com/SaltwaterC/aws2js/wiki/query.call%28%29) in favor of [query.request()](https://github.com/SaltwaterC/aws2js/wiki/query.request%28%29)
 * [Andrew Paulin](https://github.com/ConstantineXVI) - [sqs.setQueue()](https://github.com/SaltwaterC/aws2js/wiki/sqs.setQueue%28%29) helper
 * [Dave Cleal](https://github.com/dcleal) - client loader creates a new object on invocation
 * [Carlos Guerreiro](http://perceptiveconstructs.com/) - the query argument for the [s3.get()](https://github.com/SaltwaterC/aws2js/wiki/s3.get%28%29) method
