#!/usr/bin/env bash

set -euo pipefail

pattern='^([[:alnum:]-]*)-v[[:digit:]]{1,}\.[[:digit:]]{1,}\.[[:digit:]]{1,}(-[[:alpha:]]{1,}\.[[:digit:]]{1,}){0,1}$'
if [[ ! $CIRCLE_TAG =~ $pattern ]]; then
  echo "cannot parse git tag $CIRCLE_TAG from CircleCI"
  exit 1
fi

workspace=${BASH_REMATCH[1]}
if [[ $workspace = 'fetch-mock-monorepo' ]]; then
  echo "top-level fetch-mock-monorepo package should not be published"
  exit 1
else
  workspace="packages/$workspace"
fi

NPM_PUBLISH_TAG=$([[ $CIRCLE_TAG =~ -[a-z-]+$ ]] && echo "pre-release" || echo "latest")

npm publish --workspace "$workspace" --access=public --tag $NPM_PUBLISH_TAG
