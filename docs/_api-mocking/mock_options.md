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
parentMethodGroup: mocking
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
      Http method to match
  - name: headers
    types:
      - Object
      - Headers
    content: |-
      Key/value map of headers to match
  - name: query
    types:
      - Object
    content: |-
      Key/value map of query strings to match, in any order
  - name: params
    types:
      - Object
    content: |-
      When the `express:` keyword is used in a string matcher, a key/value map `params` can be passed here, to match the parameters extracted by express path matching
  - name: functionMatcher
    types:
      - Object
    content: |-
      For matching requests against arbitrary criteria. See the documentation on [`Function` matchers](#api-mockingmock_matcher)
  - name: repeat
    types:
      - Integer
    content: |-
      An integer, `n`, limiting the number of times the matcher can be used. If the route has already been called `n` times the route will be ignored and the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)
  - name: overwriteRoutes
    types:
      - Boolean
    content: See [global configuration](#usageconfiguration)
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
  - name: matcher
    content: When using the single argument variant of `.mock()`, any valid matcher as [defined above](#usageapimock_matcher) can be assigned to the options object
  - name: response
    content: When using the single argument variant of `.mock()`, any valid response as [defined above](#usageapimock_response) can be assigned to the options object
---
