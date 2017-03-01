.PHONY: test

build-sw:
	browserify test/fixtures/sw.js > test/fixtures/built-sw.js

test-dev: build-sw
	./node_modules/karma/bin/karma start

test-browser: build-sw
	./node_modules/karma/bin/karma start --single-run

test-unit:
	./node_modules/.bin/mocha test/server.js

lint:
	./node_modules/.bin/eslint src test

test: test-unit lint test-browser coverage-report

coverage-report:
	istanbul cover node_modules/.bin/_mocha --report=lcovonly 'test/server.js'
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
