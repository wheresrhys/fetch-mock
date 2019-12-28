export PATH := $(PATH):./node_modules/.bin

.PHONY: test docs

test-dev:
	karma start --browsers=Chrome

test-chrome:
	karma start --single-run --browsers=Chrome

test-firefox:
	karma start --single-run --browsers=Firefox

test-unit:
	mocha test/server.js

test-node6: transpile
	node test/node6.js

typecheck:
	dtslint --expectOnly types

lint-ci: typecheck
	eslint --ignore-pattern test/fixtures/* src test
	prettier *.md

lint: typecheck
	eslint --cache --fix .
	prettier --write *.md

coverage-report:
	nyc --reporter=lcovonly --reporter=text mocha test/server.js
	cat ./coverage/lcov.info | coveralls

local-coverage:
	nyc --reporter=html --reporter=text mocha test/server.js

transpile:
	babel src --out-dir es5

build: transpile
	if [ ! -d "cjs" ]; then mkdir cjs; fi
	cp -r src/* cjs
	rollup -c rollup.config.js

docs:
	cd docs; jekyll serve build --watch
