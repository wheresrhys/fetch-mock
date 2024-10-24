---
sidebar_position: 4
---

# Call history

`fetchMock.callHistory` is an object used to record the history of all calls handled by `fetchMock.fetchHandler`.

## CallLog schema

Calls are recorded, and returned, in a standard format with the following properties:

- **arguments** `[string|Request,Object]` - the original arguments passed in to `fetch`
- **url** `{string}` - The url being fetched
- **options** `{NormalizedRequestOptions}` - The options passed in to the fetch (may be derived from a `Request` if one was used)
- **request** `{Request}` - The `Request` passed to fetch, if one was used
- **route** `{Route}` - The route used to handle the request
- **response** `{Response}` - The `Response` returned to the user
- **expressParams** `{Object.<string,string>}` - Any express parameters extracted from the `url`
- **queryParams** `{URLSearchParams}` - Any query parameters extracted from the `url`
- **pendingPromises** `{Promise<any>[]} ` - An internal structure used by the `.flush()` method documented below

## Filtering

Most of `fetchMock.callHistory`'s methods take two arguments — `(filter, options)` — which allow `fetch` calls to be extracted and examined.

### filter

Filter calls to `fetch` using one of the following criteria:

#### undefined

Retrieve all calls made to `fetch`

#### true / "matched"

Retrieve all calls to `fetch` matched by some route defined by `fetch-mock`. The string `'matched'` can be used instead of `true` to make tests more readable

#### false / "unmatched"

Retrieve all calls to `fetch` not matched by some route defined by `fetch-mock`, i.e. calls that are handled by `.catch()`. The string `'unmatched'` can be used instead of `false` to make tests more readable

#### name

`{String}`

Retrieve all calls to `fetch` matched by a particular named route.

#### matcher

`{String|RegExp|function|Object}`
Any matcher compatible with the [route api](/fetch-mock/docs/API/route/matcher) can be passed in to filter the calls arbitrarily.

### options

`{Object}`

An options object compatible with the [route api](/fetch-mock/docs/API/route/options) to be used to filter the list of calls further.

## Methods

`fetchMock.callHistory` exposes the following methods.

> Note that fetch calls made using `(url, options)` pairs are added synchronously, but calls using a `Request` are added asynchronously. This is because when a `Request` is used access to many of its internals is via asynchronous methods, while for an options object they can be read directly. In general it's best to `await` your application code to complete before attempting to access call history.

### .recordCall(callLog)

For internal use.

### .calls(filter, options)

Returns an array of all calls matching the given `filter` and `options`. Each call is returned as a `CallLog`.

### .called(filter, options)

Returns a Boolean indicating whether any calls to `fetch` matched the given `filter` and `options`

### .lastCall(filter, options)

Returns the `CallLog` for the last call to `fetch` matching the given `filter` and `options`.

### .done(routeNames)

Returns a Boolean indicating whether `fetch` was called the expected number of times (or has been called at least once if `repeat` is not defined for the route). It does not take into account whether the `fetches` completed successfully.

A single name or an array of names can be passed in the `routeNames` parameter to check only certain routes. If no routeNames are passed it runs over all routes.

### .flush(waitForBody)

Returns a `Promise` that resolves once all fetches handled by fetch-mock have resolved

Useful for testing code that uses `fetch` but where the returned promise cannot be accessed from your tests.

If `waitForBody` is `true`, the promise will wait for all body parsing methods (`res.json()`, `res.text()`, etc.) to resolve too.
