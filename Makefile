.PHONY: all
.DEFAULT: all

all:
	/usr/bin/env npm install

lint:
	tools/lint.sh

publish:
	/usr/bin/env npm publish

simpletest: lint
	tools/test.sh

tests: test
check: test
test: all simpletest
