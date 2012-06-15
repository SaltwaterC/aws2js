all:
	/usr/bin/env npm install

publish: all
	/usr/bin/env npm publish

tests: test
check: test
test:
	tools/test.sh

purge: clean
clean:
	rm -rf node_modules
	rm -f lib/dependencies.js
