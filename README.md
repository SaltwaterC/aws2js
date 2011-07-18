## About

Amazon Web Services node.js module. Originally a fork of [aws-lib](https://github.com/livelycode/aws-lib/), but it started to draw its own lines.

## Installation

Either manually clone this repository into your node_modules directory, or the recommended method:

> npm install aws2js

## Project and Design goals

 * HTTPS-only APIs communication
 * Proper error reporting
 * Simple to write clients for a specific AWS service (abstracts most of the low level plumbing)
 * Simple to use AWS API calls
 * Higher level clients for specific work flows
 * Proper documentation

## Supported services

 * Amazon EC2 (Elastic Compute Cloud)
 * Amazon RDS (Relational Database Service)
 * Amazon SES (Simple Email Service)
 * Amazon ELB (Elastic Load Balancing)
 * Amazon S3 (Simple Storage Service)
 * Amazon IAM (Identity and Access Management)

More will come. This module is under active development.

## Usage mode

 * [[EC2 client]]
 * [[RDS client]]
 * [[SES client]]
 * [[ELB client]]
 * [[S3 client]]
 * [[IAM client]]
