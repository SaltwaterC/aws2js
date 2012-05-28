all:
	/usr/bin/env npm install

publish: all
	/usr/bin/env npm publish

tests: test
check: test
test:
	tools/test.sh

test-default:
	rm -rf node_modules
	npm install
	tools/test.sh

test-xml2js:
	rm -rf node_modules
	npm install --xml2js true
	tools/test.sh

test-mime:
	rm -rf node_modules
	npm install --mime true
	tools/test.sh

test-nobinary:
	rm -rf node_modules
	npm install --xml2js true --mime true
	tools/test.sh
