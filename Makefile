.PHONY: test

test-dev:
	./node_modules/karma/bin/karma start

test-browser:
	./node_modules/karma/bin/karma start --single-run

test-unit:
	mocha test/server.js

test: test-unit test-browser



