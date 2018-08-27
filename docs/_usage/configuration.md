---
title: Configuration
position: 7
description: On either the global or sandboxed `fetchMock` instances, the following config options can be set by setting properties on `fetchMock.config`. Many can also be set on individual calls to `.mock()`
parameters:
  - name: sendAsJson
    content:  [default `true`] - by default fetchMock will convert objects to JSON before sending. This is overrideable from each call but for some scenarios e.g. when dealing with a lot of array buffers, it can be useful to default to `false`
  - name: includeContentLength
    content:  [default `true`]: When set to true this will make fetchMock automatically add the `content-length` header. This is especially useful when combined with `sendAsJson` because then fetchMock does the conversion to JSON for you and knows the resulting length so you don’t have to compute this yourself by basically doing the same conversion to JSON.
  - name: fallbackToNetwork
    content:  [default `false`] If true then unmatched calls will transparently fall through to the network, if false an error will be thrown. If set to `always`, all calls will fall through, effectively disabling fetch-mock. to Within individual tests `.catch()` and `spy()` can be used for fine-grained control of this
  - name: overwriteRoutes
    content: : If a new route clashes with an existing route, setting `true` here will overwrite the clashing route, `false` will add another route to the stack which will be used as a fallback (useful when using the `repeat` option). Adding a clashing route without specifying this option will throw an error.
  - name: warnOnFallback
    content:  [default `true`] If true then any unmatched calls that are caught by a fallback handler (either the network or a custom function set using `catch()`) will emit warnings
  - name: Headers
    content:
  - name: Request
    content:
  - name: Response
    content:
  - name: Promise
    content:
  - name: fetch
    content:
content_markdown: |-
  When using non standard fetch (e.g. a ponyfill, or aversion of `node-fetch` other than the one bundled with `fetch-mock`) or an alternative Promise implementation, this will configure fetch-mock to use your chosen implementations.

  Note that `Object.assign(fetchMock.config, require('fetch-ponyfill')())` will configure fetch-mock to use all of fetch-ponyfill's classes. In most cases, it should only be necessary to set this once before any tests run.

---
