.PHONY: test

test-dev:
	./node_modules/karma/bin/karma start

test-browser:
	./node_modules/karma/bin/karma start --single-run

test-unit:
	mocha test/server.js

lint:
	eslint src test

test: test-unit lint test-browser



