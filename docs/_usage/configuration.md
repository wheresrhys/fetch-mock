---
title: Configuration
position: 7
description: "On either the global or sandboxed `fetchMock` instances, the following config options can be set by setting properties on `fetchMock.config`. Many can also be set on individual calls to `.mock()`"
parameters:
  - name: sendAsJson
    content: [default `true`] - by default fetchMock will convert objects to JSON before sending. This is overrideable from each call but for some scenarios e.g. when dealing with a lot of array buffers, it can be useful to default to `false`

content_markdown: |-
  When using non standard fetch (e.g. a ponyfill, or aversion of `node-fetch` other than the one bundled with `fetch-mock`) or an alternative Promise implementation, this will configure fetch-mock to use your chosen implementations.

  Note that `Object.assign(fetchMock.config, require('fetch-ponyfill')())` will configure fetch-mock to use all of fetch-ponyfill's classes. In most cases, it should only be necessary to set this once before any tests run.
---
