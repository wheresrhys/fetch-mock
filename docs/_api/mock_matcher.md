---
title: "matcher"
position: 1.1
description: "String|Regex|Function: Rule for matching calls to `fetch`."
parametersBlockTitle: Values
method: mock
parameters:
  - name: "*"
    content: Matches any url
    examples:
      - '"*"'
  - name: url
    examples:
      - |-
        "http://www.site.com/page.html"
    content: Matches an exact url
  - name: |-
      begin:
    examples:
      - |-
        "begin:http://www.site.com"
    content: Matches a url beginning with a string
  - name: |-
      end:
    examples:
      - |-
        "end:.jpg"
    content: Matches a url ending with a string
  - name: |-
      path:
    examples:
      - |-
        "path:/posts/2018/7/3"
    content: Matches a url which has a given path
  - name: |-
      glob:
    examples:
      - |-
        "glob:http://*.*"
    content: Matches a url using a glob pattern
  - name: |-
      express:
    examples:
      - |-
        "express:/user/:user"
    content: |-
      Matches a [relative] url that matches an [express style path](https://www.npmjs.com/package/path-to-regexp)
  - name: RegExp
    examples:
      - |-
        /(article|post)/\d+/
    content: Matches a url that matches a regular expression
  - name: Function
    examples:
      - |-
        (url, {headers}) => !!headers.Authorization
      - |-
        (_, _, request) => !!request.headers.get('Authorization')
    content: Matches if a function returns something truthy. the function will receive the `url` and `options` arguments `fetch` was called with. If `fetch` was called with a `Request` instance, it will be passed `url` and `options` inferred from the `Request` instance. The original `Request` will be passed as a third argument.


content_markdown: |-

---


