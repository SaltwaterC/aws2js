all:
	/usr/bin/env npm install

publish: all
	/usr/bin/env npm publish

tests: test
check: test
test:
	tools/test.sh
