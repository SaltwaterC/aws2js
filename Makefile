all:
	/usr/bin/env npm install

publish: all
	/usr/bin/env npm publish

lint:
	find lib -name *.js -print0 | xargs -0 jslint --plusplus --white --var --node --goodparts
	@echo

tests: test
check: test
test: lint
	tools/test.sh

purge: clean
clean:
	rm -rf node_modules
	rm -f lib/dependencies.js
