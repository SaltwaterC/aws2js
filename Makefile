all:
	/usr/bin/env npm install

publish: all
	/usr/bin/env npm publish

lint:
	tools/lint.sh

tests: test
check: test
test: lint
	tools/test.sh

purge: clean
clean:
	rm -rf node_modules
	rm -f lib/dependencies.js
