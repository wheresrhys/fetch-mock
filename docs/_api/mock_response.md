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
parentMethod: mock
parameters:
  - types:
      - Response
    examples:
      - "new Response('ok', {status: 200})"
    content: A `Response` instance - will be used unaltered
  - name: Status code
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
  - types:
      - Object
    content: If an object _only_ contains properties listed below it used to configure a `Response`
    options:
      - name: body
        types:
          - String
          - Object
        content: |-
          Set the response body
        examples:
          - Server responded ok
          - { token: 'abcdef' }
      - name: status
        content: Set the response status
        examples:
          - 200, 404, 503
      - name: headers
        content: Set the response headers
        examples:
          - {'Content-Type': 'text/html'}
      - name: throws
        content: |-
          `fetch` will return a `Promise` rejected with the value of `throws`
        examples:
          - "new TypeError('Failed to fetch')"


---



content: |-
      - `sendAsJson`: This property determines whether or not the request body should be converted to `JSON` before being sent (defaults to `true`).
      - `includeContentLength`: Set this property to true to automatically add the `content-length` header (defaults to `true`).
      - `redirectUrl`: _experimental_ the url the response should be from (to imitate followed redirects - will set `redirected: true` on the response)
content_markdown: |-


  - `configObject` If an object _does not contain_ any properties aside from those listed below it is treated as config to build a `Response`
    - `body`: Set the response body (`string` or `object`)
    - `status`: Set the response status (default `200`)
    - `headers`: Set the response headers. (`object`)
    - `throws`: If this property is present then fetch returns a `Promise` rejected with the value of `throws`
    - `sendAsJson`: This property determines whether or not the request body should be converted to `JSON` before being sent (defaults to `true`).
    - `includeContentLength`: Set this property to true to automatically add the `content-length` header (defaults to `true`).
    - `redirectUrl`: _experimental_ the url the response should be from (to imitate followed redirects - will set `redirected: true` on the response)
  - `object`: All objects that do not meet the criteria above are converted to `JSON` and returned as the body of a 200 response.
  - `Function(url, opts)`: A function that is passed the url and opts `fetch()` is called with and that returns any of the responses listed above (or a `Promise` for any of them)
