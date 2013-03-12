## About

Amazon Web Services node.js module. Originally a fork of [aws-lib](https://github.com/livelycode/aws-lib/).

 * [Changelog](https://github.com/SaltwaterC/aws2js/blob/master/doc/CHANGELOG.md)
 * [License](https://github.com/SaltwaterC/aws2js/blob/master/doc/LICENSE.md)

## Installation

Either manually clone this repository into your `node_modules` directory, then run `npm install` on the aws2js top directory, or the recommended method:

> npm install aws2js

The installation depends on [npm](https://github.com/isaacs/npm) 1.1.x+ as it uses the optionalDependencies feature which means that node.js v0.4.x isn't supported. Technically, it still works, but you need to manually install an XML parser and a MIME library that aws2js can use.

Since v0.8 all the dependencies are installed (if possible), then the library uses its feature detection to try its best. Picking your favorite isn't possible, unless you actually uninstall the modules you don't want the library to use. I had it implemented in v0.7. It was a maintenance nightmare.

The optional dependencies are:

 * [libxml-to-js](https://github.com/SaltwaterC/libxml-to-js), [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) - for XML parsing
 * [mime-magic](https://github.com/SaltwaterC/mime-magic), [mime](https://github.com/broofa/node-mime) - for automatically setting the Content-Type for S3 uploads, if the header is missing

aws2js prefers libxml-to-js and mime-magic for various reasons. Under Windows, the libxml-to-js installation should fail, therefore it uses xml2js. Please notice that the mime library detects the MIME type by doing a file extension lookup, while mime-magic does it the proper way by wrapping the functionality of libmagic. You have been warned.

## Project and Design goals

 * HTTPS-only APIs communication (exceptions allowed for HTTP-only APIs)
 * Proper error reporting
 * Simple to write clients for a specific AWS service (abstracts most of the low level plumbing)
 * Simple to use AWS API calls
 * Higher level clients for specific work flows
 * Proper documentation

The HTTPS support isn't working as intended due to lack of proper node.js support till v0.8.5, therefore the usage of previous node.js versions is deprecated. The host based addressing for S3 buckets must be changed in order to avoid [the situation presented into the documentation](https://github.com/SaltwaterC/aws2js/wiki/Bucket-Name).

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

## Contributions

For the moment, this project is largely a one man show. Bear with me if things don't move as fast as they should. There are a handful of [aws2js contributors](https://github.com/SaltwaterC/aws2js/blob/master/doc/CONTRIBUTORS.md) as well. The community makes things to be better for everyone.

If you'd like to contribute your line of code (or more), please send a pull request against the future branch. This makes things to be easier on my side. Feature branches are also acceptable. Even commits in your master branch are acceptable. I don't rely on GitHub's merge functionality as I always pull from remotes and manually issue the merge command.

I ask you to patch against the future branch since that's the place where all the development happens, therefore it should be the least conflicts when merging your code. I use the master only for integrating the releases. The master branch always contains the latest stable release.
