---
title: Configuration
position: 7
description: "On either the global or sandboxed `fetchMock` instances, the following config options can be set by setting properties on `fetchMock.config`. Many can also be overridden on individual calls to `.mock()`"
parameters:
  - name: sendAsJson
    content: Convert objects into JSON before delivering as stub reponses. Can be useful to set to `false` globally if e.g. dealing with a lot of non-text responses. If `true`, will also add a `content-type: application/json` header [default: `true`]

content_markdown: |-
  When using non standard fetch (e.g. a ponyfill, or aversion of `node-fetch` other than the one bundled with `fetch-mock`) or an alternative Promise implementation, this will configure fetch-mock to use your chosen implementations.

  Note that `Object.assign(fetchMock.config, require('fetch-ponyfill')())` will configure fetch-mock to use all of fetch-ponyfill's classes. In most cases, it should only be necessary to set this once before any tests run.
---
