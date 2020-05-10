---
title: 'response'
position: 1.2
description: |-
  Configures the http response returned by the mock. Accepts any of the following values or a `Promise` for any of them (useful when testing race conditions, loading transitions etc.). Unless otherwise stated, all responses have a `200` status
types:
  - String
  - Object
  - Function
  - Promise
  - Response
type: parameter
parametersBlockTitle: Argument values
parentMethod: mock
parentMethodGroup: mocking
parameters:
  - types:
      - Response
    versionAdded: 5.0.0
    examples:
      - "new Response('ok', {status: 200})"
    content: |
      A [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response) instance to return unaltered.

      Note that it must use the same constructor as that used in the `fetch` implementation your application uses. [See how to configure this](#usagecustom-classes)

  - name: status code
    versionAdded: 1.2.0
    types:
      - Integer
    examples:
      - 200, 404, 503
    content: Return a `Response` with the given status code. The response's `statusText` will also be set to the [default value corresponding to the status](https://fetch.spec.whatwg.org/#dom-response-statustext)
  - types:
      - String
    versionAdded: 1.0.0
    content: Return a 200 `Response` with the string as the response body
    examples:
      - Server responded ok
      - Bad Response
  - name: config
    versionAdded: 1.0.0
    types:
      - Object
    content: If an object *only* contains properties from among those listed below it is used to configure a `Response` to return
    options:
      - name: body
        versionAdded: 1.0.0
        types:
          - String
          - Object
        content: |-
          Set the `Response` body. See the non-config `Object` section of the docs below for behaviour when passed an `Object`
        examples:
          - Server responded ok
          - "{ token: 'abcdef' }"
      - name: status
        versionAdded: 1.0.0
        types:
          - Integer
        content: Set the `Response` status
        examples:
          - 200, 404, 503
      - name: headers
        versionAdded: 1.0.0
        types:
          - Object
        content: Set the `Response` headers
        examples:
          - "{'Content-Type': 'text/html'}"
      - name: redirectUrl
        versionAdded: 6.0.0
        types:
          - String
        content: |-
          The url from which the `Response` should claim to originate from (to imitate followed directs). Will also set `redirected: true` on the response
      - name: throws
        versionAdded: 1.0.0
        types:
          - Error
        content: |-
          Force `fetch` to return a `Promise` rejected with the value of `throws`
        examples:
          - "new TypeError('Failed to fetch')"
  - types:
      - Object
      - ArrayBuffer
      - ...
    versionAdded: 1.0.0
    content: |-
      If the `sendAsJson` option is set to `true`, any object that does not meet the criteria above will be converted to a `JSON` string and set as the response `body`. Otherwise, the object will be set as the response `body` (useful for `ArrayBuffer`s etc.)
  - types:
      - Promise
    versionAdded: 4.2.0
    content: |-
      A `Promise` that resolves to any of the options documented above
    examples:
      - 'new Promise(res => setTimeout(() => res(200), 50))'
  - types:
      - Function
    versionAdded: 1.0.0
    content: |-
      A function that returns any of the options documented above. The function will be passed the `url` and `options` `fetch` was called with. If `fetch` was called with a `Request` instance, it will be passed `url` and `options` inferred from the `Request` instance, with the original `Request` will be passed as a third argument.
    examples:
      - '(url, opts) => opts.headers.Authorization ? 200 : 403'
      - "(_, _, request) => request.headers.get('Authorization') ?  200 : 403"
---
