## Requirements

 * AWS_ACCEESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables which target to proper accessKeyId and secretAccessKey credentials. These are used for all the tests, therefore if the credentials are from a IAM user, they must be permissive enough in order to succesfully run all the tests.
 * AWS2JS_S3_BUCKET environment variable which indicates the S3 bucket where the tests should upload their contents.
 * bash shell. The test framework works on Windows under MinGW/MSYS.
 * The following *nix utils: cut, awk, bc.
 * The tests directory must be writable by the system user that runs the tests.
 * jslint, installed globally (eg: [sudo] npm -g install jslint - sudo is not required for nvm-like installations)
