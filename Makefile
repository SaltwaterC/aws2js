.PHONY: all
.DEFAULT: all

all:
	/usr/bin/env npm install

lint:
	tools/lint.sh

publish:
	/usr/bin/env npm publish

tests: test
check: test
test: lint all
	tools/test.sh
