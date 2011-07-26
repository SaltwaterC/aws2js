## v0.3.5
 * Adds again the [backport-0.4](https://github.com/SaltwaterC/backport-0.4) dependency, v0.4.10-1, that targets issue [#1399](https://github.com/joyent/node/issues/1399) from node v0.4.10. This release fixes a rare race condition that may appear when doing S3 PUT requests with bodies that are streamed from files.

## v0.3.4
 * Drops the [backport-0.4](https://github.com/SaltwaterC/backport-0.4) dependency. node.js v0.4.10 finally came around with the desired fixes. Only node 0.4.10 and above is supported.
 * Adds support for Amazon Auto Scaling.
 * Exposes the client.setMaxSockets() method for changing the https.Agent.defaultMaxSockets property.

## v0.3.3
 * Adds [backport-0.4](https://github.com/SaltwaterC/backport-0.4) as module dependency in order to properly fix the broken request.abort() support. This version is crappy workaround-free.
 * Adds support for Amazon Identity and Access Management (IAM).

## v0.3.2
 * If the WriteStream fails when the file response handler is in use by the GET request, the HTTPS request itself is aborted. Previously it was continued, therefore it might waste a lot of bandwidth, that you're going to pay for. This task was not trivial as a bug in node.js complicates the implementation of this feature: https://github.com/joyent/node/issues/1085 . In the future, aws2js will require specifically node 0.5.x if the abort() patches are accepted into the upstream. The garbage that makes the workarounds for the abort() issues (1085, 1304) will be removed.

## v0.3.1
 * Changes file the GET response handler to receive an object indicating the file path instead the file path itself in order to introduce more flexibility. Unfortunately this introduces a slight backward incompatibility. Hate doing it, but it's a must.
 * Fixes the acl checker that did not accept a false value in order to go with the default 'private'.

## v0.3
 * The README relies on Wiki pages in order to provide the docs.
 * Client loader. Previously all the clients were loaded when aws2js was required. Now a specific client is loaded when executing the exported load() method. Unfortunately, this introduces backward incompatibility.
 * Amazon S3 support.
 * Amazon ELB support.
 * Made the Amazon RDS API version to be the latest 2011-04-01 by default.
 * Made the Amazon SES API version to be the latest 2010-12-01 by default.
 * Adds mime as dependency due to mime/type auto-detection for S3 uploads.
 * Removed the client.config() method as it may break more stuff than it introduces.

## v0.2.2
 * Updates the libxml-to-js dependency to v0.2.
 * Fixes the client.setRegion() call as it is currently broken.
 * Disables client.setRegion() for SES.

## v0.2.1
 * Implements the Amazon Simple Email Service (SES) client.

## v0.2
 * Migrated to a cleaner XML to JS implementation (my own libxml-to-js wrapper).
 * Initial public release with versioning and npm support.

## v0.1
 * Initial version, featuring Amazon EC2 and Amazon RDS support.
