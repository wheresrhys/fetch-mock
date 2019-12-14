---
title: "matcher"
position: 1.1
description: |-
  Condition for deciding which requests to mock. For matching headers, query strings or other `fetch` options see the [`options` parameter](#api-mockingmock_options)
types:
  - String
  - RegExp
  - Function
  - URL
type: parameter
parametersBlockTitle: Argument values
parentMethod: mock
parentMethodGroup: mocking
parameters:
  - name: "*"
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
        /(article|post)/\d+/
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


content_markdown: |-
  Note that if using `end:` or an exact url matcher, fetch-mock ([for good reason](https://url.spec.whatwg.org/#url-equivalence)) is unable to distinguish whether URLs without a path end in a trailing slash or not i.e. `http://thing` is treated the same as `http://thing/`
  {: .warning}
---


