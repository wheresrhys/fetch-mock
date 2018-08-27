---
title: Configuration
position: 7
description: "On any `fetchMock` instance, config can be set by setting properties on `fetchMock.config`."
parametersBlockTitle: Options
parameters:
  - name: sendAsJson
    default: true
    content: |-
      Convert objects into JSON before delivering as stub reponses. Can be useful to set to `false` globally if e.g. dealing with a lot of array buffers. If `true`, will also add `content-type: application/json` header.
  - name: includeContentLength
    default: true
    content: Automatically sets a `content-length` header on each response.
  - name: fallbackToNetwork
    default: false
    content: |-
      - `true`: Unhandled calls transparently fall through to the network
      - `false`: Unhandled calls throw an error
      - `'always'`: All calls fall through to the network, effectively disabling fetch-mock.

content_markdown: |-
  Many of the options above can be overridden for individual calls to `.mock(matcher, response, options)` by setting as properties on the third parameter, `options`
  {: .info}

  When using non standard fetch (e.g. a ponyfill, or aversion of `node-fetch` other than the one bundled with `fetch-mock`) or an alternative Promise implementation, this will configure fetch-mock to use your chosen implementations.

  Note that `Object.assign(fetchMock.config, require('fetch-ponyfill')())` will configure fetch-mock to use all of fetch-ponyfill's classes. In most cases, it should only be necessary to set this once before any tests run.
---
