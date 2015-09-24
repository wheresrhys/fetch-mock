.PHONY: test

test:
	mocha test/server.js
	./node_modules/karma/bin/karma start --single-run
