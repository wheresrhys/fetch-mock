.PHONY: test

test-dev:
	./node_modules/karma/bin/karma start --browsers=Chrome

test-chrome:
	./node_modules/karma/bin/karma start --single-run --browsers=Chrome

test-firefox:
	./node_modules/karma/bin/karma start --single-run --browsers=Firefox

test-unit:
	./node_modules/.bin/mocha test/server.js

test-node6:
	node test/node6.js

lint:
	./node_modules/.bin/eslint --ignore-pattern test/fixtures/* src test

coverage-report:
	./node_modules/.bin/istanbul cover node_modules/.bin/_mocha --report=lcovonly 'test/server.js'
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

local-coverage:
	./node_modules/.bin/istanbul cover node_modules/.bin/_mocha 'test/server.js'
