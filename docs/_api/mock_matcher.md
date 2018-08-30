---
title: "matcher"
position: 1.1
description: |-
  Condition for selecting which requests to mock. For matching based on headers, query strings or other `fetch` options see the `options` parameter documented below
types:
  - String
  - Regex
  - Function
type: parameter
parametersBlockTitle: Argument values
parentMethod: mock
parameters:
  - name: "*"
    types:
      - String
    content: Matches any url
    examples:
      - '"*"'
  - name: url
    types:
      - String
    examples:
      - |-
        "http://www.site.com/page.html"
    content: Matches an exact url
  - name: |-
      begin:
    types:
      - String
    examples:
      - |-
        "begin:http://www.site.com"
    content: Matches a url beginning with a string
  - name: |-
      end:
    types:
      - String
    examples:
      - |-
        "end:.jpg"
    content: Matches a url ending with a string
  - name: |-
      path:
    types:
      - String
    examples:
      - |-
        "path:/posts/2018/7/3"
    content: Matches a url which has a given path
  - name: |-
      glob:
    types:
      - String
    examples:
      - |-
        "glob:http://*.*"
    content: Matches a url using a glob pattern
  - name: |-
      express:
    types:
      - String
    examples:
      - |-
        "express:/user/:user"
    content: |-
      Matches a [relative] url that matches an [express style path](https://www.npmjs.com/package/path-to-regexp)
  - types:
      - RegExp
    examples:
      - |-
        /(article|post)/\d+/
    content: Matches a url that matches a regular expression
  - types:
      - Function
    examples:
      - |-
        (url, {headers}) => !!headers.Authorization
      - |-
        (_, _, request) => !!request.headers.get('Authorization')
    content: Matches if a function returns something truthy. The function will be passed the arguments `fetch` was called with. If `fetch` was called with a `Request` instance, it will be passed `url` and `options` inferred from the `Request` instance. The original `Request` will be passed as a third argument.


content_markdown: |-
  Note that if using `end:` or an exact url matcher, fetch-mock ([for good reason](https://url.spec.whatwg.org/#url-equivalence)) is unable to distinguish whether URLs without a path end in a trailing slash or not i.e. `http://thing` is treated the same as `http://thing/`
  {: .warning}
---


