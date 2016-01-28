.PHONY: test

test-dev:
	./node_modules/karma/bin/karma start

test-browser:
	./node_modules/karma/bin/karma start --single-run

test-unit:
	./node_modules/.bin/mocha test/server.js

lint:
	./node_modules/.bin/eslint src test

test: test-unit lint test-browser
