---
title: '.mock(matcher, response, options)'
navTitle: .mock()
position: 1
versionAdded: 2.0.0
versionAddedDetails: Callable with no arguments since v7.6.0
description: |
  Check out the new [cheatsheet](https://github.com/wheresrhys/fetch-mock/blob/master/docs/cheatsheet.md)
  {: .info}

  Initialises or extends a stub implementation of fetch, applying a `route` that matches `matcher`, delivers a `Response` configured using `response`, and that respects the additional `options`. The stub will record its calls so they can be inspected later. If `.mock` is called on the top level `fetch-mock` instance, this stub function will also replace `fetch` globally. Calling `.mock()` with no arguments will carry out this stubbing without defining any mock responses.

  In the documentation, **route** is often used to refer to the combination of matching and responding behaviour set up using a single call to `mock()`
  {: .warning}
parameters:
  - name: matcher
    versionAdded: 2.0.0
    types:
      - String
      - Regex
      - Function
      - Object
    content: Criteria for which calls to `fetch` should match this route
  - name: response
    versionAdded: 2.0.0
    types:
      - String
      - Object
      - Function
      - Promise
      - Response
    content: Response to send when a call is matched
  - name: options
    versionAdded: 2.0.0
    types:
      - Object
    content: More options to configure matching and responding behaviour
content_markdown: |-

  Alternatively a single parameter, `options`, an Object with `matcher`, `response` and other options defined, can be passed in. 

  For complex matching (e.g. matching on headers in addition to url), there are 4 patterns to choose from:

  1. Use an object as the first argument, e.g. 
  ```js
  fetchMock
    .mock({url, headers}, response)
  ``` 
  This has the advantage of keeping all the matching criteria in one place.
  2. Pass in options in a third parameter e.g.
  ```js
  fetchMock
    .mock(url, response, {headers})
  ```
  This splits matching criteria between two parameters, which is arguably harder to read. However, if most of your tests only match on url, then this provides a convenient way to create a variant of an existing test.
  3. Use a single object, e.g. 
  ```js
  fetchMock
    .mock({url, response, headers})
  ```
  Nothing wrong with doing this, but keeping response configuration in a separate argument to the matcher config feels like a good split.
  4. Use a function matcher e.g. 
  ```js
  fetchMock
    .mock((url, options) => {
    // write your own logic 
  }, response)
  ```
  Avoid using this unless you need to match on some criteria fetch-mock does not support.

left_code_blocks:
  - title: Strings
    code_block: |-
      fetchMock
        .mock('http://it.at.here/route', 200)
        .mock('begin:http://it', 200)
        .mock('end:here/route', 200)
        .mock('path:/route', 200)
        .mock('*', 200)
    language: javascript
  - title: Complex Matchers
    code_block: |-
      fetchMock
        .mock(/.*\.here.*/, 200)
        .mock((url, opts) => opts.method === 'patch', 200)
        .mock('express:/:type/:id', 200, {
          params: {
            type: 'shoe'
          }
        })
        .mock({
          headers: {'Authorization': 'Bearer 123'},
          method: 'POST'
        }, 200)
    language: javascript
  - title: Responses
    code_block: |-
      fetchMock
        .mock('*', 'ok')
        .mock('*', 404)
        .mock('*', {results: []})
        .mock('*', {throw: new Error('Bad kitty')))
        .mock('*', new Promise(res => setTimeout(res, 1000, 404)))
        .mock('*', (url, opts) => {
          status: 302, 
          headers: {
            Location: url.replace(/^http/, 'https')
          }, 
        }))
    language: javascript
  - title: End to end example
    language: javascript
    code_block: |-
      fetchMock
        .mock('begin:http://it.at.here/api', 403)
        .mock({
          url: 'begin:http://it.at.here/api',
          headers: {
            authorization: 'Basic dummy-token'
          }
        }, 200)
        
      callApi('/endpoint', 'dummy-token')
        .then(res => {
          expect(res.status).to.equal(200)
        })
---
