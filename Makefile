.PHONY: test

build-sw:
	browserify test/fixtures/sw.js > test/fixtures/built-sw.js

test-dev: build-sw
	./node_modules/karma/bin/karma start

test-chrome: build-sw
	./node_modules/karma/bin/karma start --single-run --browsers=Chrome

test-firefox: build-sw
	./node_modules/karma/bin/karma start --single-run --browsers=Firefox

test-unit:
	./node_modules/.bin/mocha test/server.js

lint:
	./node_modules/.bin/eslint src test

coverage-report:
	istanbul cover node_modules/.bin/_mocha --report=lcovonly 'test/server.js'
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
