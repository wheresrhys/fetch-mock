export PATH := $(PATH):./node_modules/.bin

.PHONY: test docs

SHELL := env "PATH=$(PATH)" /bin/bash
NPM_PUBLISH_TAG := $(shell [[ "$(CIRCLE_TAG)" =~ -[a-z-]+ ]] && echo "pre-release" || echo "latest")
TEST_BROWSER := $(shell [ -z $(TEST_BROWSER) ] && echo "Chrome" || echo ${TEST_BROWSER})

typecheck:
	dtslint --expectOnly types

lint-ci:
	eslint --ext .js,.mjs --ignore-pattern test/fixtures/* src test
	prettier *.md docs/*.md docs/**/*.md

lint:
	eslint --cache --fix --ext .js,.mjs --ignore-pattern test/fixtures/* src test
	prettier --cache --write *.md docs/*.md docs/**/*.md

verify: lint

coverage:
	nyc --reporter=lcovonly --reporter=text make test
	cat ./coverage/lcov.info | coveralls

docs:
	cd docs; jekyll serve build --watch

build:
	npx rollup -c

publish:
	echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > ${HOME}/.npmrc
	npm version --no-git-tag-version $(CIRCLE_TAG)
	npm publish --access public --tag $(NPM_PUBLISH_TAG)

test:
	TESTING_ENV=server npx vitest ./test/specs

test-coverage:
	TESTING_ENV=server npx vitest run --coverage ./test/specs

test-node-fetch:
	TESTING_ENV=node-fetch npx vitest ./test/specs

test-commonjs:
	TESTING_ENV=commonjs npx vitest ./test/specs

test-browser:
	TESTING_ENV=browser npx vitest ./test/specs
