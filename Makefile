.PHONY: test

build-sw:
	./node_modules/.bin/webpack --entry ./test/fixtures/sw.js --output-filename ./test/fixtures/built-sw.js

test-dev: build-sw
	./node_modules/karma/bin/karma start --browsers=Chrome

test-chrome: build-sw
	./node_modules/karma/bin/karma start --single-run --browsers=Chrome

test-firefox: build-sw
	./node_modules/karma/bin/karma start --single-run --browsers=Firefox

test-unit:
	./node_modules/.bin/mocha test/server.js

lint:
	./node_modules/.bin/eslint --ignore-pattern test/fixtures/* src test

coverage-report:
	./node_modules/.bin/istanbul cover node_modules/.bin/_mocha --report=lcovonly 'test/server.js'
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

local-coverage:
	./node_modules/.bin/istanbul cover node_modules/.bin/_mocha 'test/server.js'
