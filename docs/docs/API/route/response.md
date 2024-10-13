---
sidebar_position: 2
---

# response

Configures the http response returned by `fetchHandler`. Unless otherwise stated, all responses have a `200` status

## Response

`{Response}`

A [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response) instance to return unaltered.

## Status code

`{Int}`

Returns a `Response` with the given status code, e.g. `200`. The response's `statusText` will also be set to the [default value corresponding to the status](https://fetch.spec.whatwg.org/#dom-response-statustext).

## String

`{String}`

Returns a 200 `Response` with the string as the response body e.g. `"<html><head>..."`

## Response config

`{Object}`

If the object _only_ contains properties from among those listed below it is used to configure a `Response` to return.

### body

`{String|Object|BodyInit}`

Set the `Response` body. This could be

- a string e.g. `"Server responded ok"`, `{ token: 'abcdef' }`.
- an object literal (see the `Object` section of the docs below).
- Anything else that satisfies the specification for the [body parameter of new Response()](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#body). This currently allows instances of Blob, ArrayBuffer, TypedArray, DataView, FormData, ReadableStream, URLSearchParams, and String.

### status

`{Int}`

Sets the `Response` status e.g. `200`

### headers

`{Object}`

Sets the `Response` headers, e.g `{'Content-Type': 'text/html'}`

### redirectUrl

`{String}`

Sets the url from which the `Response` should claim to originate (to imitate followed directs). Will also set `redirected: true` on the response

### throws

`{Error}`

Forces `fetch` to return a `Promise` rejected with the value of `throws` e.g. `new TypeError('Failed to fetch')`

## Object

`{Object}`

Any object literal that does not match the schema for a response config will be converted to a `JSON` string and set as the response `body`.

The `Content-Type: application/json` header will also be set on each response. To send JSON responses that do not set this header (e.g. to mock a poorly configured server) manually convert the object to a string first e.g.

```js
fetchMock.route('http://a.com', JSON.stringify({ prop: 'value' }));
```

## Promise

`{Promise}`

A `Promise` that resolves to any of the options documented above e.g. `new Promise(res => setTimeout(() => res(200), 50))`

## Function

`{Function}`

A function that is passed a [`CallLog`](/fetch-mock/docs/@fetch-mock/core/CallHistory#calllog-schema) and returns any of the options documented above (including `Promise`).

### Examples

- `({url, options}) => options.headers.Authorization ? 200 : 403`
- `({request}) => request.headers.get('Authorization') ?  200 : 403`
