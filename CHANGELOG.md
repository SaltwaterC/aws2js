## v0.5
 * [MIGHT BREAK COMPAT] The S3 paths are now escaped. The chars that normally aren't part of an S3 path are now URL encoded.
 * The 'closed' events of the HTTPS response are treated as errors. The AWS APIs should end the request cleanly. Normally they do. This fixes possible hangs of the HTTPS support.
 * Avoids the node.js issue [#1399](https://github.com/joyent/node/issues/1399), which is still undecided, by having a state indicating that the HTTPS request isn't aborted. Basically this workaround removes the [backport-0.4](https://github.com/SaltwaterC/backport-0.4) dependency as crashing the process can be avoided without bundling my own http.js + https.js.
 * Adds the client.getApiVersion() method in order to indicate which is the default or defined API version. The query APIs support this feature. This is an elegant way of wrapping client.query.Version which may be an arcane methodology for outsiders. Usually useful for debugging.
 * Adds the client.setApiVersion() method for setting the API version. The query APIs support this feature.
 * Adds s3.setEndPoint() helper for the S3 client.
 * Adds Amazon CloudWatch support.
 * Adds Amazon ElastiCache support.
 * Enables the client.getEndPoint() for all the API clients.
 * Updates the EC2 API client to default to version 2011-07-15.
 * Updates the ELB API client to default to version 2011-08-15.
 * Updates the AutoScaling API client to default to version 2011-01-01.
 * The input query for the query argument of the query APIs takes precendence over the query parameters that are configured into the client itself. This allows per API call custom configuration (eg: Version - indicates the API version).
 * Integrates with [mime-magic](https://github.com/SaltwaterC/mime-magic) to provide the automatic MIME type detenction when the Content-Type header for the S3 PUT operation is undefined. This method does a bit of I/O, it is slower than the previous method for computing the MIMEs, but the results are more reliable. The libmagic functionality returns the MIME type by reading the file itself.
 * The client.call() method makes the query argument to be optional.
 * Changed the internal structure of the library.
 * Unit testing coverage.

## v0.4.4
 * Fixes a possible race condition that could appear into the fsync(2) wrapper.

## v0.4.3
 * Proper support for the fsync(2) wrapper. If s3.get() is used for downloading the objects to the disk, the ENOENT errors that could happened from time to time should now be gone.

## v0.4.2
 * Adds s3.renameObject().
 * Fixes the error reporting. When an AWS API didn't return XML as response body, the callback wasn't called.

## v0.4.1
 * Fixes the broken handling of error reporting of the XML parsing.

## v0.4
 * [BREAKS COMPAT] Removed the response argument in case of error. If there's an error document returned by the AWS API itself, it is exposed as error.document. This may break some code that expects the error document to be returned as the response argument. This change unifies the error reporting that won't expect the result argument anymore.
 * [MIGHT BREAK COMPAT] Returns the error argument as null in case of success in order to follow the node.js convention instead of undefined. This may break some code if the evaluation was made against 'undefined'.
 * Exposes client.getEndPoint() method if the client.setRegion() method is available.
 * Calls [fsync(2)](http://linux.die.net/man/2/fsync) after each downloaded file via s3.get() in order to make sure that the application has a consistent behavior when the s3.get() callback is called.

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
 * If the WriteStream fails when the file response handler is in use by the GET request, the HTTPS request itself is aborted. Previously it was continued, therefore it might waste a lot of bandwidth, that you're going to pay for. This task was not trivial as a bug in node.js complicates the implementation of this feature. See [#1085](https://github.com/joyent/node/issues/1085).

## v0.3.1
 * Changes file the GET response handler to receive an object indicating the file path instead the file path itself in order to introduce more flexibility. Unfortunately this introduces a slight backward incompatibility. Hate doing it, but it's a must.
 * Fixes the acl checker that did not accept a false value in order to go with the default 'private'.

## v0.3
 * [BREAKS COMPAT] Client loader. Previously all the clients were loaded when aws2js was required. Now a specific client is loaded when executing the exported load() method. Unfortunately, this introduces backward incompatibility.
 * [BREAKS COMPAT] Removed the client.config() method as it may break more stuff than it introduces.
 * The README relies on Wiki pages in order to provide the docs.
 * Amazon S3 support.
 * Amazon ELB support.
 * Made the Amazon RDS API version to be the latest 2011-04-01 by default.
 * Made the Amazon SES API version to be the latest 2010-12-01 by default.
 * Adds [mime](https://github.com/bentomas/node-mime) as dependency due to mime/type auto-detection for S3 uploads.

## v0.2.2
 * Updates the libxml-to-js dependency to v0.2.
 * Fixes the client.setRegion() call as it is currently broken.
 * Disables client.setRegion() for SES.

## v0.2.1
 * Implements the Amazon Simple Email Service (SES) client.

## v0.2
 * Migrated to a cleaner XML to JS implementation (my own [libxml-to-js](https://github.com/SaltwaterC/libxml-to-js) wrapper).
 * Initial public release with versioning and npm support.

## v0.1
 * Initial version, featuring Amazon EC2 and Amazon RDS support.
