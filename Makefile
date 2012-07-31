.PHONY: all
.DEFAULT: all

all:
	/usr/bin/env npm install

publish: all
	/usr/bin/env npm publish

lint:
	tools/lint.sh

purge: clean
clean:
	rm -rf node_modules
	rm -f lib/dependencies.js

tests: test
check: test
test: lint purge
	$(MAKE) test-default
	$(MAKE) test-xml2js
	$(MAKE) test-mime
	$(MAKE) test-nobinary

test-default: lint
	@npm install > /dev/null 2>&1
	tools/test.sh

test-xml2js: purge
	@npm install --xml2js true > /dev/null 2>&1
	tools/test.sh

test-mime: purge
	@npm install --mime true > /dev/null 2>&1
	tools/test.sh

test-nobinary: purge
	@npm install --xml2js true --mime true > /dev/null 2>&1
	tools/test.sh
