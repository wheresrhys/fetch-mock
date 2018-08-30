---
title: "response"
position: 1.2
description: |-
  Response to send matched calls.
  Configures the http response returned by the mock. Can take any of the following values (or be a `Promise` for any of them, enabling full control when testing race conditions etc.). Unless otherwise stated, all responses have a `200` status
types:
  - String
  - Object
  - Function
  - Promise
  - Response
type: parameter
parametersBlockTitle: Argument values
parentMethod: mock
parameters:
  - types:
      - Response
    examples:
      - "new Response('ok', {status: 200})"
    content: A `Response` instance - will be used unaltered
  - name: status code
    types:
      - String
    examples:
      - 200, 404, 503
    content: Creates a response with the given status code. The response's `statusText` will also be set to the [default value corresponding to the status](https://fetch.spec.whatwg.org/#dom-response-statustext)
  - types:
      - String
    content: Creates a 200 response with the string as the response body
    examples:
      - Server responded ok
      - Bad Response
  - name: config
    types:
      - Object
    content: If an object _only_ contains properties listed below it is used to configure a `Response`
    options:
      - name: body
        types:
          - String
          - Object
        content: |-
          Set the response body. For behaviour for `Object`s, see the non-config `Object` section of the docs below
        examples:
          - Server responded ok
          - { token: 'abcdef' }
      - name: status
        types:
          - Integer
        content: Set the response status
        examples:
          - 200, 404, 503
      - name: headers
        types:
          - Object
        content: Set the response headers
        examples:
          - {'Content-Type': 'text/html'}
      - name: redirectUrl
        types:
          - String
        content: |-
          The url the response should claim to originate from (to imitate followed directs). Will also set `redirected: true` on the response
      - name: throws
        types:
          - Error
        content: |-
          `fetch` will return a `Promise` rejected with the value of `throws`
        examples:
          - "new TypeError('Failed to fetch')"
  - types:
    - Object
    - ArrayBuffer
    content: |-
      All objects that do not meet the criteria above will be converted to JSON and set as the response `body` if the `sendAsJson` option is on. Otherwise, they will be set as the response `body` (useful for array buffers etc.)
  - types:
    - Promise
    content: |-
      A `Promise` that resolves to any of the options documented above
    examples:
      - "new Promise(res => setTimeout(() => res(200), 50))"
  - types:
    - Function
    content: |-
      A function that is passed the arguments `fetch` is called with and that returns any of the responses listed above
    examples:
      - "(url, opts) => opts.headers.Authorization ? 200 : 403"
      - "(_, _, request) => request.headers.get('Authorization') ?  200 : 403"

---
