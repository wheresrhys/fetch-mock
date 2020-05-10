export PATH := $(PATH):./node_modules/.bin

.PHONY: test docs

NPM_PUBLISH_TAG := $(shell [[ "$(CIRCLE_TAG)" =~ -[a-z-]+ ]] && echo "pre-release" || echo "latest")
TEST_BROWSER := $(shell [ -z $(TEST_BROWSER) ] && echo "Chrome" || echo ${TEST_BROWSER})

# intended for local dev
test:
	mocha test/server.js

test-browser:
	@if [ -z $(CI) ]; \
		then karma start --browsers=${TEST_BROWSER}; \
		else karma start --single-run --browsers=${TEST_BROWSER}; \
	fi

test-node6: transpile
	node test/node6.js

typecheck:
	dtslint --expectOnly types

lint-ci:
	eslint --ignore-pattern test/fixtures/* src test
	prettier *.md docs/*.md docs/**/*.md

lint:
	eslint --cache --fix --ignore-pattern test/fixtures/* src test
	prettier --write *.md docs/*.md docs/**/*.md

coverage:
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

publish:
	echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > ${HOME}/.npmrc
	npm version --no-git-tag-version $(CIRCLE_TAG)
	npm publish --access public --tag $(NPM_PUBLISH_TAG)
