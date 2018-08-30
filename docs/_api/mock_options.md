---
title: "options"
position: 1.3
description: |-
  A configuration object with properties to define a route to mock
types:
  - Object
type: parameter
parametersBlockTitle: Options
parentMethod: mock
parameters:
  - name: name
    types:
      - String
    content: |-
      A unique string naming the route. Used to subsequently retrieve references to the calls, grouped by name. Defaults to `matcher.toString()`
  - name: method
    types:
      - String
    content: |-
      http method to match
  - name: headers
    types:
      - Object | Headers
    content: |-
      key/value map of headers to match
  - name: query
    types:
      - Object
    content: |-
      key/value map of query strings to match, in any order
  - name: params
    types:
      - Object
    content: |-
      when the `express:` keyword is used in a string matcher, a key/value map `params` can be passed here, to match the parameters extracted by express path matching
  - name: repeat
    type:
      - Integer
    content: |-
      An integer, `n`, limiting the number of times the matcher can be used. If the route has already been called `n` times the route will be ignored and the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)
  - name: overwriteRoutes
    content: |-
      If the route you're adding clashes with an existing route, setting `true` here will overwrite the clashing route, `false` will add another route to the stack which will be used as a fallback (useful when using the `repeat` option). Adding a clashing route without specifying this option will throw an error. It can also be set as a global option (see the **Config** section below)
  - name: sendAsJson
    default: true
    types:
      - Boolean
    content: See [global configuration](#usageconfiguration)
  - name: includeContentLength
    default: true
    types:
      - Boolean
    content: See [global configuration](#usageconfiguration)
---


  - name: matcher
    content: |-
      as specified above
  - name: response
    content: |-
      as specified above



  - name: sendAsJson<sup>†</sup>
    default: true
    content: |-
      Convert objects into JSON before delivering as stub reponses. Can be useful to set to `false` globally if e.g. dealing with a lot of array buffers. If `true`, will also add `content-type: application/json` header.
  - name: includeContentLength
    default: true
    content: Automatically sets a `content-length` header on each response.
  - name: fallbackToNetwork<sup>†</sup>
    default: "false"
    content: |-
      - `true`: Unhandled calls fall through to the network
      - `false`: Unhandled calls throw an error
      - `'always'`: All calls fall through to the network, effectively disabling fetch-mock.
  - name: overwriteRoutes<sup>†</sup>
    default: "undefined"
    content: |-
      Determines behaviour if a new route has the same name (or inferred name) as an existing one
      - `undefined`: An error will be throw when routes clash
      - `true`: Overwrites the existing route
      - `false`: Appends the new route to the list of routes
  - name: warnOnFallback<sup>†</sup>
    default: true
    content: |-
      Print a warning if any call is caught by a fallback handler (set using the `fallbackToNetwork` option or `catch()`)



