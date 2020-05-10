---
title: Configuration
position: 7
versionAdded: 6.0.0
description: |-
  On any `fetch-mock` instance, set configuration options directly on the `fetchMock.config` object. e.g.
  ```js
  const fetchMock = require('fetch-mock');
  fetchMock.config.sendAsJson = false;
  ```
parametersBlockTitle: Options
parameters:
  - name: sendAsJson<sup>†</sup>
    versionAdded: 4.1.0
    default: true
    types:
      - Boolean
    content: |-
      Always convert objects passed to `.mock()` to JSON strings before building reponses. Can be useful to set to `false` globally if e.g. dealing with a lot of `ArrayBuffer`s. When `true` the `Content-Type: application/json` header will also be set on each response.
  - name: includeContentLength<sup>†</sup>
    versionAdded: 5.13.0
    default: true
    types:
      - Boolean
    content: Sets a `Content-Length` header on each response.
  - name: fallbackToNetwork
    versionAdded: 6.5.0
    versionAddedDetails: "'always' option added in v6.5.0"
    default: 'false'
    types:
      - Boolean
      - String
    content: |-
      - `true`: Unhandled calls fall through to the network
      - `false`: Unhandled calls throw an error
      - `'always'`: All calls fall through to the network, effectively disabling fetch-mock.
  - name: overwriteRoutes<sup>†</sup>
    default: 'undefined'
    versionAdded: 6.0.0
    types:
      - Boolean
    content: |-
      Configures behaviour when attempting to add a new route with the same name (or inferred name) as an existing one
      - `undefined`: An error will be thrown
      - `true`: Overwrites the existing route
      - `false`: Appends the new route to the list of routes
  - name: matchPartialBody
    versionAdded: 9.1.0
    types:
      - Boolean
    content: Match calls that only partially match a specified body json. Uses the [is-subset](https://www.npmjs.com/package/is-subset) library under the hood, which implements behaviour the same as jest's [.objectContainig()](https://jestjs.io/docs/en/expect#expectobjectcontainingobject) method.
  - name: warnOnFallback
    versionAdded: 6.0.0
    default: true
    types:
      - Boolean
    content: |-
      Print a warning if any call is caught by a fallback handler (set using `catch()`, `spy()` or the `fallbackToNetwork` option)
  - name: Promise
    types:
      - Constructor
    versionAdded: 5.9.0
    content: A custom `Promise` constructor, if your application uses one
  - name: fetch
    types:
      - Function
    content: A custom `fetch` implementation, if your application uses one
  - name: Headers
    types:
      - Constructor
    versionAdded: 5.9.0
    content: The `Headers` constructor of a custom `fetch` implementation, if your application uses one
  - name: Request
    types:
      - Constructor
    versionAdded: 5.9.0
    content: The `Request` constructor of a custom `fetch` implementation, if your application uses one
  - name: Response
    types:
      - Constructor
    versionAdded: 5.0.0
    content: The `Response` constructor of a custom `fetch` implementation, if your application uses one

content_markdown: |-
  Options marked with a `†` can also be overridden for individual calls to `.mock(matcher, response, options)` by setting as properties on the `options` parameter
---
