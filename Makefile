.PHONY: all
.DEFAULT: all
REPORTER ?= dot

all:
	@/usr/bin/env npm install

lint:
	@tools/lint.sh config lib test tools

publish:
	@/usr/bin/env npm publish

tests: test
check: test
test: all lint
	@./node_modules/.bin/mocha --reporter $(REPORTER) -g LOCAL

fulltest:
	@./node_modules/.bin/mocha --reporter $(REPORTER) -t 10000

clean:
	rm -rf node_modules

beautify:
	@tools/beautify.sh

versions:
	@tools/versions.js
