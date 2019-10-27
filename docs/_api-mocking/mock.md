---
title: ".mock(matcher, response, options)"
navTitle: .mock()
position: 1.0
description: |
  Initialises or extends a stub implementation of fetch, applying a `route` that matches `matcher`, delivers a `Response` configured using `response`, and that respects the additional `options`. The stub will record its calls so they can be inspected later. If `.mock` is called on the top level `fetch-mock` instance, this stub function will also replace `fetch` globally. Calling `.mock()` with no arguments will carry out this stubbing without defining any mock responses.

  *In the documentation **route** is often used to refer to the combination of matching and responding behaviour set up using a single call to `mock()`*
parameters:
  - name: matcher
    types:
      - String
      - Regex
      - Function
    content: Rule for which calls to `fetch` should match this route
  - name: response
    types:
      - String
      - Object
      - Function
      - Promise
      - Response
    content: Response to send when a call is matched
  - name: options
    types:
      - Object
    content: More options to configure matching and responding behaviour
content_markdown: |-
  Alternatively a single parameter, `options`, an Object with `matcher`, `response` and other options defined, can be passed in
  

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
  - title: End to end example
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
---


