---
title: Configuration
position: 7
description: |-
  On any `fetchMock` instance, config can be set by setting properties on `fetchMock.config`.
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
    default: "false"
    content: |-
      - `true`: Unhandled calls fall through to the network
      - `false`: Unhandled calls throw an error
      - `'always'`: All calls fall through to the network, effectively disabling fetch-mock.
  - name: overwriteRoutes
    default: "undefined"
    content: |-
      Determines behaviour if a new route has the same name (or inferred name) as an existing one
      - `undefined`: An error will be throw when routes clash
      - `true`: Overwrites the existing route
      - `false`: Appends the new route to the list of routes
  - name: warnOnFallback
    default: true
    content: |-
      Print a warning if any call is caught by a fallback handler (set using the `fallbackToNetwork` option or `catch()`)
  - name: Promise
    content: Reference to the `Promise` constructor of a custom `Promise` implementation
  - name: fetch
    content: Reference to a custom `fetch` implementation
  - name: Headers
    content: Reference to the `Headers` constructor of a custom `fetch` implementation
  - name: Request
    content: Reference to the `Request` constructor of a custom `fetch` implementation
  - name: Response
    content: Reference to the `Response` constructor of a custom `fetch` implementation

content_markdown: |-
  Many of the options above can be overridden for individual calls to `.mock(matcher, response, options)` by setting as properties on the third parameter, `options`
  {: .info}

---
