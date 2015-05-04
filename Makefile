.PHONY: test

test:
	mocha test/server.js
	./node_modules/karma/bin/karma start --single-run

coverage:
	mocha test/server.js -R mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js
