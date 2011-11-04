## Requrements

 * $AWS_ACCEESS_KEY_ID and $AWS_SECRET_ACCESS_KEY environment variables which target to proper accessKeyId and secretAccessKey credentials. These are used for all the tests, therefore if the credentials are from a IAM user, they must be permissive enough in order to succesfully run all the tests.
 * $AWS2JS_S3_BUCKET environment variable which indicates the S3 bucket that contains the test data.
 * The contents of the tests/data directory must be in the root of the above configured S3 bucket. The contents must have the 'public-read' canned ACL in order to test them with a 3rd party HTTP client implementation: [http-get](https://github.com/SaltwaterC/http-get). Install by running `npm install http-get`.
 * The tests directory must be writable by the system user that runs the tests.
