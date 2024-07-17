---
title: 'optionsOrName'
sidebar:
  order: 3
---

Either

- An object containing further options for configuring mocking behaviour.
- A string, which will be used as the route's name

## General options

### name

`{String}`

A unique string naming the route. Used to subsequently retrieve references to the calls handled by it. Only needed for advanced use cases.

### response

Instead of defining the response as the second argument of `mock()`, it can be passed as a property on the first argument. See the [response documentation](#usageapimock_response) for valid values.

### repeat

`{Int}`

Limits the number of times the route can be used. If the route has already been called `repeat` times, the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)

### delay

`{Int}`

Delays responding for the number of milliseconds specified.

### sticky

`{Boolean}`

Avoids a route being removed when `reset()`, `restore()` or `resetBehavior()` are called. _Note - this does not preserve the history of calls to the route_

### sendAsJson

`{Boolean}`

See [global configuration](#usageconfiguration)

### includeContentLength

`{Boolean}`

See [global configuration](#usageconfiguration)

### overwriteRoutes

`{Boolean}`

See [global configuration](#usageconfiguration)

## Options for defining matchers

If multiple mocks use the same url matcher but use different options, such as `headers`, you will need to use the `overwriteRoutes: false` option.

### url

`{String|RegExp}`

Use any of the `String` or `RegExp` matchers described in the documentation fro the `matcher` parameter.

### functionMatcher

`{Function}`

Use a function matcher, as described in the documentation fro the `matcher` parameter.

### method

`{String}`

Match only requests using this http method. Not case-sensitive, e.g. `"get"`, `"POST"`

### headers

`{Object|Headers}`

Match only requests that have these headers set, e.g. `{"Accepts": "text/html"}`

### body

`{Object}`

Match only requests that send a JSON body with the exact structure and properties as the one provided here.

Note that if matching on body _and_ using `Request` instances in your source code, this forces fetch-mock into an asynchronous flow _before_ it is able to route requests effectively. This means no [inspection methods](#api-inspectionfundamentals) can be used synchronously. You must first either await the fetches to resolve, or `await fetchMock.flush()`. The popular library [Ky](https://github.com/sindresorhus/ky) uses `Request` instances internally, and so also triggers this mode.

e.g.`{ "key1": "value1", "key2": "value2" }`

### matchPartialBody

`{Boolean}`

Match calls that only partially match a specified body json. See [global configuration](#usageconfiguration) for details.

### query

`{Object}`

Match only requests that have these query parameters set (in any order). Query parameters are matched by using Node.js [querystring](https://nodejs.org/api/querystring.html) module. In summary the bahaviour is as follows

- strings, numbers and booleans are coerced to strings
- arrays of values are coerced to repetitions of the key
- all other values, including `undefined`, are coerced to an empty string
  The request will be matched whichever order keys appear in the query string.
  Any query parameters sent in the request which are not included in the keys of the object provided will be ignored.

#### Examples

- `{"q": "cute+kittenz"}` `?q=cute kittenz` or `?q=cute+kittenz` or `?q=cute+kittenz&mode=big`
- `{"tags": ["cute", "kittenz"]}` `?tags=cute&tags=kittenz`
- `{"q": undefined, inform: true}` `?q=&inform=true`

### params

`{Object}`

When the `express:` keyword is used in a string matcher, match only requests with these express parameters e.g `{"section": "feed", "user": "geoff"}`
