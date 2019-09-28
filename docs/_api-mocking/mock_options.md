---
title: 'options'
position: 1.3
description: |-
  An object containing further options for configuring mocking behaviour
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
      A unique string naming the route. Used to subsequently retrieve references to the calls handled by it
  - name: method
    types:
      - String
    content: |-
      Match only requests using this http method. Not case-sensitive
    examples:
      - get, POST
  - name: headers
    types:
      - Object
      - Headers
    content: |-
      Match only requests that have these headers set
    examples:
      - |-
        {"Accepts": "text/html"}
  - name: body
    types:
      - Object
    content: |-
      Match only requests that send a JSON body with the exact structure and properties as the one provided here (also requires that the request has a `Content-Type` request header set to `application/json`)
    examples:
      - |-
        { "key1": "value1", "key2": "value2" }
  - name: query
    types:
      - Object
    content: |-
      Match only requests that have these query parameters set (in any order)
    examples:
      - |-
        {"q": "cute+kittenz", "format": "gif"}
  - name: params
    types:
      - Object
    content: |-
      When the `express:` keyword is used in a string matcher, match only requests with these express parameters
    examples:
      - |-
        {"section": "feed", "user": "geoff"}
  - name: functionMatcher
    types:
      - Object
    content: |-
      For matching requests against arbitrary criteria. See the documentation on [`Function` matchers](#api-mockingmock_matcher)
  - name: repeat
    types:
      - Integer
    content: |-
      Limits the number of times the route can be used. If the route has already been called `repeat` times, the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)
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
    content: When using the single argument variant of `.mock()`, any valid matcher as [documented above](#usageapimock_matcher) can be assigned to the options object
  - name: response
    content: When using the single argument variant of `.mock()`, any valid response as [documented above](#usageapimock_response) can be assigned to the options object
---
