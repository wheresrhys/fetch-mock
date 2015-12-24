.PHONY: test

test-dev:
	./node_modules/karma/bin/karma start

test-browser:
	./node_modules/karma/bin/karma start --single-run

test: test-browser
	mocha test/server.js

