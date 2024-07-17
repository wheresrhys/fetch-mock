---
title: 'response'
sidebar:
  order: 2
---

Configures the http response returned by the mock. Accepts any of the following values or a `Promise` for any of them (useful when testing race conditions, loading transitions etc.). Unless otherwise stated, all responses have a `200` status

## Argument values

### Response

`{Response}`
A [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response) instance to return unaltered.

Note that it must use the same constructor as that used in the `fetch` implementation your application uses. [See how to configure this](#usagecustom-classes) e.g. `new Response('ok', {status: 200})`

### Status code

`{Int}`
Return a `Response` with the given status code. The response's `statusText` will also be set to the [default value corresponding to the status](https://fetch.spec.whatwg.org/#dom-response-statustext), e.g. `200`

### String

`{String}`
Return a 200 `Response` with the string as the response body e.g. `"Bad Response"`

### Response config

`{Object}`

If an object _only_ contains properties from among those listed below it is used to configure a `Response` to return.

#### Object properties

##### body

`{String|Object}`
Set the `Response` body. See the non-config `Object` section of the docs below for behaviour when passed an `Object` e.g. `"Server responded ok"`, `{ token: 'abcdef' }`

##### status

`{Int}`
Sets the `Response` status e.g. `200`

##### headers

`{Object}`
Sets the `Response` headers, e.g `{'Content-Type': 'text/html'}`

##### redirectUrl

`{String}`
The url from which the `Response` should claim to originate from (to imitate followed directs). Will also set `redirected: true` on the response

##### throws

`{Error}`
Force `fetch` to return a `Promise` rejected with the value of `throws` e.g. `new TypeError('Failed to fetch')`

### Object

`{Object|ArrayBuffer|...`
If the `sendAsJson` option is set to `true`, any object that does not meet the criteria above will be converted to a `JSON` string and set as the response `body`. Otherwise, the object will be set as the response `body` (useful for `ArrayBuffer`s etc.)

### Promise

`{Promise}`
A `Promise` that resolves to any of the options documented above e.g. `new Promise(res => setTimeout(() => res(200), 50))`

### Function

`{Function}`
A function that returns any of the options documented above (including `Promise`. The function will be passed the `url` and `options` `fetch` was called with. If `fetch` was called with a `Request` instance, it will be passed `url` and `options` inferred from the `Request` instance, with the original `Request` passed as a third argument.

#### Examples

- `(url, opts) => opts.headers.Authorization ? 200 : 403`
- `(_, _, request) => request.headers.get('Authorization') ?  200 : 403`
