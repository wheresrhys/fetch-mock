export PATH := $(PATH):./node_modules/.bin

.PHONY: test docs

SHELL := env "PATH=$(PATH)" /bin/bash
NPM_PUBLISH_TAG := $(shell [[ "$(CIRCLE_TAG)" =~ -[a-z-]+ ]] && echo "pre-release" || echo "latest")
TEST_BROWSER := $(shell [ -z $(TEST_BROWSER) ] && echo "Chrome" || echo ${TEST_BROWSER})

# intended for local dev
test:
	mocha --file test/server-setup.js test/{server-specs,specs}/*.test.js test/specs/**/*.test.js

test-browser:
	@if [ -z $(CI) ]; \
		then karma start --browsers=${TEST_BROWSER}; \
		else karma start --single-run --browsers=${TEST_BROWSER}; \
	fi

test-es5:
	node test/es5.js

test-esm:
	FETCH_MOCK_SRC=../esm/server.js ./node_modules/.bin/mocha test/server.mjs

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


transpile:
	babel src --out-dir es5

build: transpile
	if [ ! -d "cjs" ]; then mkdir cjs; fi
	cp -r src/* cjs
	rollup -c rollup.config.js
	echo '{"type": "module"}' > esm/package.json
	cp types/index.d.ts esm/client.d.ts
	cp types/index.d.ts esm/server.d.ts

docs:
	cd docs; jekyll serve build --watch

publish:
	echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > ${HOME}/.npmrc
	npm version --no-git-tag-version $(CIRCLE_TAG)
	npm publish --access public --tag $(NPM_PUBLISH_TAG)
