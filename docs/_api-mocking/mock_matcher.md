---
title: 'matcher'
position: 1.1
description: |-
  Criteria for deciding which requests to mock.

  Note that if you use matchers that target anything other than the url string, you may also need to add a `name` to your matcher object so that a) you can add multiple mocks on the same url that differ only in other properties (e.g. query strings or headers) b) if you [inspect](#api-inspectionfundamentals) the result of the fetch calls, retrieving the correct results will be easier. 
  {: .warning}
types:
  - String
  - RegExp
  - Function
  - URL
  - Object
type: parameter
parametersBlockTitle: Argument values
parentMethod: mock
parentMethodGroup: mocking
parameters:
  - name: '*'
    types:
      - String
    content: Match any url
    examples:
      - '"*"'
  - name: url
    types:
      - String
      - URL
    examples:
      - |-
        "http://www.site.com/page.html"
    content: Match an exact url. Can be defined using a string or a `URL` instance
  - name: |-
      begin:...
    types:
      - String
    examples:
      - |-
        "begin:http://www.site.com"
    content: Match a url beginning with a string
  - name: |-
      end:...
    types:
      - String
    examples:
      - |-
        "end:.jpg"
    content: Match a url ending with a string
  - name: |-
      path:...
    types:
      - String
    examples:
      - |-
        "path:/posts/2018/7/3"
    content: Match a url which has a given path
  - name: |-
      glob:...
    types:
      - String
    examples:
      - |-
        "glob:http://*.*"
    content: Match a url using a glob pattern
  - name: |-
      express:...
    types:
      - String
    examples:
      - |-
        "express:/user/:user"
    content: |-
      Match a url that satisfies an [express style path](https://www.npmjs.com/package/path-to-regexp)
  - types:
      - RegExp
    examples:
      - |-
        /(article|post)\/\d+/
    content: Match a url that satisfies a regular expression
  - types:
      - Function
    examples:
      - |-
        (url, {headers}) => !!headers.Authorization
      - |-
        (_, _, request) => !!request.headers.get('Authorization')
    content: |
      Match if a function returns something truthy. The function will be passed the `url` and `options` `fetch` was called with. If `fetch` was called with a `Request` instance, it will be passed `url` and `options` inferred from the `Request` instance, with the original `Request` will be passed as a third argument.

      This can also be set as a `functionMatcher` in the [options parameter](#api-mockingmock_options), and in this way powerful arbitrary matching criteria can be combined with the ease of the declarative matching rules above.
  - types:
      - Object
    examples:
      - |-
        {url: 'end:/user/profile', headers: {Authorization: 'Basic 123'}}
      - |-
        {query: {search: 'abc'}, method: 'POST'}
    content: |
      The url and function matchers described above can be combined with other criteria for matching a request by passing an an object which may have one or more of the properties described below. All these options can also be define on the third `options` parameters of the `mock()` method.
    options:
      - name: url
        types:
          - String
          - RegExp
        content: |-
          Use any of the `String` or `RegExp` matchers described above. *Note that the property name 'matcher' can be used instead of 'url', but this is deprecated and support will be dropped in the next major version, so prefer to use 'url'*
      - name: functionMatcher
        types:
          - Function
        content: |-
          Use a function matcher, as described above
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
          Match only requests that send a JSON body with the exact structure and properties as the one provided here. 

          Note that if matching on body _and_ using `Request` instances in your source code, this forces fetch-mock into an asynchronous flow _before_ it is able to route requests effectively. This means no [inspection methods](#api-inspectionfundamentals) can be used synchronously. You must first either await the fetches to resolve, or `await fetchMock.flush()`. The popular library [Ky](https://github.com/sindresorhus/ky) uses `Request` instances internally, and so also triggers this mode.
          {: .warning}

        examples:
          - |-
            { "key1": "value1", "key2": "value2" }
      - name: matchPartialBody
        types:
          - Boolean
        content: Match calls that only partially match a specified body json. See [global configuration](#usageconfiguration) for details.
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
      - name: repeat
        types:
          - Integer
        content: |-
          Limits the number of times the route can be used. If the route has already been called `repeat` times, the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)
      - name: name
        types:
          - String
        content: |-
          A unique string naming the route. Used to subsequently retrieve references to the calls handled by it. Only needed for advanced use cases.
      - name: overwriteRoutes
        types:
          - Boolean
        content: See [global configuration](#usageconfiguration)
      - name: response
        content: Instead of defining the response as the second argument of `mock()`, it can be passed as a property on the first argument. See the [response documentation](#usageapimock_response) for valid values.
content_markdown: |-
  Note that if using `end:` or an exact url matcher, fetch-mock ([for good reason](https://url.spec.whatwg.org/#url-equivalence)) is unable to distinguish whether URLs without a path end in a trailing slash or not i.e. `http://thing` is treated the same as `http://thing/`
  {: .warning}

   If multiple mocks use the same `matcher` but use different options, such as `headers`, you will need to use the `overwriteRoutes: false` option.
  {: .warning}
---
