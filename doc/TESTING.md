## Requirements

 * The mocha and chai modules. They are specified into the devDependencies. Issuing `npm install` on the root directory of aws2js pulls them from npm. `make test` runs the local unit tests that don't require the interaction with AWS. `make fulltest` runs the whole testing suite.
 * jslint which is also in devDependencies for running the lint target before the test or the fulltest target.
 * make utility for easier inteaction.
 * AWS_ACCEESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables which target to proper accessKeyId and secretAccessKey credentials. These are used for the fulltest make target, therefore if the credentials are from a IAM user, they must be permissive enough in order to succesfully run all the remote tests.
 * AWS2JS_S3_BUCKET environment variable which indicates the S3 bucket where the tests should upload their contents.
 * AWS2JS_SQS_QUEUE environment variable which indicates the SQS queue to be used.
 * The `aws2js/test` directory must be writable by the user who runs the tests.
 * dos2unix in $PATH. Mainly as precaution in case something like [#67](https://github.com/reid/node-jslint/issues/67) on jslint happens again
