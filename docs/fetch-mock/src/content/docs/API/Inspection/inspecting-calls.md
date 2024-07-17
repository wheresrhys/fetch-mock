---
title: 'Inspecting calls'
sidebar:
  order: 1
tableOfContents:
  maxHeadingLevel: 5
---

## Methods

### .calls(filter, options)

Returns an array of all calls to fetch matching the given `filter` and `options`. Each call is returned as a `[url, options]` array. If `fetch` was called using a `Request` instance, the `url` and `options` will be inferred from it, and the original `Request` will be available as a `request` property on this array.

### .called(filter, options)

Returns a Boolean indicating whether any calls to `fetch` matched the given `filter` and `options`

### .lastCall(filter, options)

Returns the arguments for the last call to `fetch` matching the given `filter` and `options`. The call is returned as a `[url, options]` array. If `fetch` was called using a `Request` instance, the `url` and `options` will be inferred from it, and the original `Request` will be available as a `request` property on this array.

### .lastUrl(filter, options)

Returns the url for the last call to `fetch` matching the given `filter` and `options`. If `fetch` was last called using a `Request` instance, the url will be inferred from this

### .lastOptions(filter, options)

Returns the options for the last call to `fetch` matching the given `filter` and `options`. If `fetch` was last called using a `Request` instance, a set of `options` inferred from the `Request` will be returned

### .lastResponse(filter, options)

Returns the `Response` for the last call to `fetch` matching the given `filter` and `options`. This is an experimental feature, very difficult to implement well given fetch's very private treatment of response bodies.

If `.lastResponse()` is called before fetch has been resolved then it will return `undefined`

When doing all the following:

- using node-fetch
- responding with a real network response (using spy() or fallbackToNetwork)
- using \`fetchMock.LastResponse()\`
- awaiting the body content  
  ... the response will hang unless your source code also awaits the response body.
  This is an unavoidable consequence of the nodejs implementation of streams.

To obtain json/text responses await the `.json()/.text()` methods of the response

## Filtering

`fetch-mock`'s inspection methods allow information about how `fetch` was called to be retrieved after your application code has run. Most inspection methods take two arguments — `(filter, options)` — which allow individual, or groups of, `fetch` calls to be extracted and examined.

### Parameters

#### filter

Filter calls to `fetch` using one of the following criteria:

##### undefined

Retrieve all calls made to `fetch`

##### true / "matched"

Retrieve all calls to `fetch` matched by some route defined by `fetch-mock`. The string `'matched'` can be used instead of `true` to make tests more readable

##### false / "unmatched"

Retrieve all calls to `fetch` not matched by some route defined by `fetch-mock`. The string `'unmatched'` can be used instead of `false` to make tests more readable

##### routeIdentifier

`{String|RegExp|function}`

All routes have an identifier:

- If it's a [named route](#api-mockingmock_options), the identifier is the route's `name`
- If the route is unnamed, the identifier is the value of the `matcher` argument that was passed in to `.mock()`

All calls that were handled by the route with the given identifier will be retrieved

##### matcher

`{String|RegExp|function}`
Any matcher compatible with the [mocking api](#api-mockingmock_matcher) can be passed in to filter the calls arbitrarily. The matcher will be executed using exactly the same rules as the mocking api

#### options

`{Object|String}`

Either an object compatible with the [mocking api](#api-mockingmock_options) or a string specifying a http method to filter by. This will be used to filter the list of calls further

### Caveats

#### Confusing API

The filtering API is powerful, but potentially confusing. If in doubt, [add a `name` to your route](#api-mockingmock_options), and pass that name in to retrieve exactly the calls you want.

The API will be simplified and changed significantly in the next major version

#### Regular Expression and Function matchers

To retrieve calls handled by a route with a `RegExp` or `function` matcher, use a reference to the exact `RegExp`|`function` you used in your mock, e.g.

```javascript
const matcherRX = /user\/biff/
fm.mock(matcherRX, 200)
...
fm.called(matcherRX)
```

not

```javascript
fm.mock(/user\/biff/, 200)
...
fm.called(/user\/biff/)
```

The second example _will_ retrieve the expected calls in simple test scenarios because if no routes match using the identifier the `RegExp` will be executed as a `RegExp` matcher. But in more complex scenarios where e.g. there are several routes handling similar paths, it might retrieve calls that were actually handled by different, similar route e.g.

```javascript
const matcherRX = /user\/biff/
fm
  .mock('end:user/biff')
  .mock(matcherRX, 200)
...
// this will retrieve calls handled by either route
fm.called(/user\/biff/)
// this will retrieve only calls handled by the second route
fm.called(matcherRX)
```
