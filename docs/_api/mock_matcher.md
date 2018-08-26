---
title: ".mock() - matcher "
position: 1.1
description: String|Regex|Function: Rule for matching calls to `fetch`
parameters:
  - name: *
    content: Matches any url
  - name: url, e.g. 'http://www.site.com/page.html'
    content: Match an exact url
content_markdown: |-

  - `matcher`: Condition for selecting which requests to mock. (For matching based on headers, query strings or other `fetch` options see the `options` parameter documented below). Accepts any of the following:
    - `string`: Either
      - an exact url to match e.g. 'http://www.site.com/page.html'
      - `*` to match any url
      - `begin:http://www.site.com/` to match urls beginning with a string
      - `end:.jpg` to match urls ending with a string
      - `path:/posts/2018/7/3` to match urls with a given path
      - `glob:http://*.*` to match glob patterns
      - `express:/user/:user` to match [express style paths](https://www.npmjs.com/package/path-to-regexp)
    - `RegExp`: A regular expression to test the url against
    - `Function(url, opts)`: A function (returning a Boolean) that is passed the url and opts `fetch()` is called with (or, if `fetch()` was called with one, the `Request` instance)

  _Note that if using `end:` or an exact url matcher, `fetch-mock` ([for good reason](https://url.spec.whatwg.org/#url-equivalence)) is unable to distinguish whether URLs without a path end in a trailing slash or not i.e. `http://thing` is treated the same as `http://thing/`_



right_code_blocks:
  - title: Example
    language: javascript
    code_block: |-
      fetchMock
        .mock('begin:http://it.at.here/api', 200, {
          headers: {
            authorization: 'Basic dummy-token'
          }
        })
        .mock('begin:http://it.at.here/api', 403)

      callApi('/endpoint', 'dummy-token')
        .then(res => {
          expect(res.status).to.equal(200)
        })

left_code_blocks:
  - code_block: |-
      fetchMock
        .mock('http://it.at.here/route', 200)
        .mock('begin:http://it', 200)
        .mock('end:here/route', 200)
        .mock('path:/route', 200)
        .mock('*', 200)
    title: Strings
    language: javascript
  - code_block: |-
      fetchMock
        .mock(/.*\.here.*/, 200)
        .mock((url, opts) => opts.method === 'patch', 200)
        .mock('express:/:type/:id', 200, {
          params: {
            type: 'shoe'
          }
        })
    title: Complex Matchers
    language: javascript
  - code_block: |-
      fetchMock
        .mock('*', 'ok')
        .mock('*', 404)
        .mock('*', {results: []})
        .mock('*', {throw: new Error('Bad kitty')))
        .mock('*', new Promise(res => setTimeout(res, 1000, 404)))
    title: Responses
    language: javascript
---


