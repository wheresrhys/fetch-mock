- [Introduction](/fetch-mock)
- [Quickstart](/fetch-mock/quickstart)
- [Installation and usage](/fetch-mock/installation)
- API documentation
- [Troubleshooting](/fetch-mock/troubleshooting)
- [Examples](/fetch-mock/examples)

# API Documentation

## Mocking calls to `fetch`

#### `mock(matcher, response, options)` or `mock(options)`

Replaces `fetch` with a stub which records its calls, grouped by route, and optionally returns a mocked `Response` object or passes the call through to `fetch()`. Calls to `.mock()` can be chained. _Note that once mocked, `fetch` will error on any unmatched calls. Use `.spy()` or `.catch()` to handle unmocked calls more gracefully_

- `matcher`: Condition for selecting which requests to mock. (For matching based on headers, query strings or other `fetch` options see the `options` parameter documented below). Accepts any of the following:
  - `string`: Either
    - an exact url to match e.g. 'http://www.site.com/page.html'
    - `*` to match any url
    - `begin:http://www.site.com/` to match urls beginning with a string
    - `end:.jpg` to match urls ending with a string
    - `path:/posts/2018/7/3` to match urls with a given path
    - `glob:http://*.*` to match glob patterns
    - `express:/user/:user` to match [express style paths](https://www.npmjs.com/package/path-to-regexp)
  - `RegExp`: A regular expression to test the url against
  - `Function(url, opts)`: A function (returning a Boolean) that is passed the url and opts `fetch()` is called with (or, if `fetch()` was called with one, the `Request` instance)

_Note that if using `end:` or an exact url matcher, `fetch-mock` ([for good reason](https://url.spec.whatwg.org/#url-equivalence)) is unable to distinguish whether URLs without a path end in a trailing slash or not i.e. `http://thing` is treated the same as `http://thing/`_

- `response`: Configures the http response returned by the mock. Can take any of the following values (or be a `Promise` for any of them, enabling full control when testing race conditions etc.)
  - `Response`: A `Response` instance - will be used unaltered
  - `number`: Creates a response with this status
  - `string`: Creates a 200 response with the string as the response body
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
- `options`: A configuration object with all/additional properties to define a route to mock
  - `name`: A unique string naming the route. Used to subsequently retrieve references to the calls, grouped by name. Defaults to `matcher.toString()`
  - `method`: http method to match
  - `headers`: key/value map of headers to match
  - `query`: key/value map of query strings to match, in any order
  - `params`: when the `express:` keyword is used in a string matcher, a key/value map `params` can be passed here, to match the parameters extracted by express path matching
  - `matcher`: as specified above
  - `response`: as specified above
  - `repeat`: An integer, `n`, limiting the number of times the matcher can be used. If the route has already been called `n` times the route will be ignored and the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)
  - `overwriteRoutes`: If the route you're adding clashes with an existing route, setting `true` here will overwrite the clashing route, `false` will add another route to the stack which will be used as a fallback (useful when using the `repeat` option). Adding a clashing route without specifying this option will throw an error. It can also be set as a global option (see the **Config** section below)

#### `sandbox()`

This returns a drop-in mock for fetch which can be passed to other mocking libraries. It implements the full fetch-mock api and maintains its own state independent of other instances, so tests can be run in parallel. e.g.

#### `once()`

Shorthand for `mock()` which limits to being called one time only. (see `repeat` option above)

#### `get()`, `post()`, `put()`, `delete()`, `head()`, `patch()`

Shorthands for `mock()` restricted to a particular method _Tip: if you use some other method a lot you can easily define your own shorthands e.g.:_

```
fetchMock.purge = function (matcher, response, options) {
    return this.mock(matcher, response, Object.assign({}, options, {method: 'PURGE'}));
}
```

#### `getOnce()`, `postOnce()`, `putOnce()`, `deleteOnce()`, `headOnce()`, `patchOnce()`

Shorthands for `mock()` restricted to a particular method and that will only respond once

#### `catch(response)`

This is used to define how to respond to calls to fetch that don't match any of the defined mocks. It accepts the same types of response as a normal call to `.mock()`. It can also take an arbitrary function to completely customise behaviour of unmatched calls. It is chainable and can be called before or after other calls to `.mock()`. If `.catch()` is called without any parameters then every unmatched call will receive a `200` response

#### `spy()`

Similar to `catch()`, this records the call history of unmatched calls, but instead of responding with a stubbed response, the request is passed through to native `fetch()` and is allowed to communicate over the network.

To use `.spy()` on a sandboxed `fetchMock`, `fetchMock.config.fetch` must be set to a reference to the `fetch` implementation you use in your code.

```
    fetchMock.sandbox().mock('http://domain.com', 200)
```

Existing sandboxed `fetchMock`s can also have `.sandbox()` called on them, thus building mocks that inherit some settings from a parent mock

#### `restore()/reset()`

Chainable method that restores `fetch()` to its unstubbed state and clears all data recorded for its calls.

#### `resetHistory()`

Chainable method that clears all data recorded for `fetch()`'s calls. _It will not restore fetch to its default implementation_

_Note that `restore()`, `reset()` and `resetHistory()` are all bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.reset)` will work just fine. There is no need for `afterEach(function () {fetchMock.reset()})`_

## Inspecting how `fetch()` has been called

### Filtering

Most of the methods below accept two parameters, `(filter, options)`

- `filter` Enables filtering fetch calls for the most commonly use cases. The behaviour can be counterintuitive. The following rules, applied in the order they are described, are used to try to retrieve calls. If any rule retrieves no calls the next rule will be tried.
  - If `options` is defined (it can even be an empty object), `filter` is executed using the same execution plan as matchers used in `.mock()`. Any calls matched by it will be returned. `options` will be used in a similar way to the options used by `mock()`. `options` may be a string specifying a `method` to filter by
  - If `filter` is `undefined` all calls, matched _and_ unmatched, are returned
  - If `filter` is `true` (or `fetchMock.MATCHED`) all calls that matched some route are returned
  - If `filter` is `false` (or `fetchMock.UNMATCHED`) all calls that did not match any route are returned (when `.spy()`, `catch()` or `config.fallThroughToNetwork` were used to prevent errors being thrown)
  - If `filter` is the name of a named route, all calls handled by that route are returned
  - If `filter` is equal to `matcher` or `matcher.toString()` for a route, all calls handled by that route are returned
  - `filter` is executed using the same execution plan as matchers used in `.mock()`. Any calls matched by it will be returned.

#### `called(filter, method)`

Returns a Boolean indicating whether fetch was called and a route was matched. If `filter` is specified it only returns `true` if that particular route was matched.

#### `done(filter, method)`

Returns a Boolean indicating whether fetch was called the expected number of times (or at least once if the route defines no expectation is set for the route). _Unlike the other methods for inspecting calls, unmatched calls are irrelevant_. Therefore, if no `filter` is passed, `done()` returns `true` if every route has been called the number of expected times.

#### `calls(filter, method)`

Returns an array of all calls to fetch matchingthe given filters. Each call is returned as an array of length 2, `[url, options]`. If `fetch` was called using a `Request` instance, thsi will be available as a `request` property on this array.

#### `lastCall(filter, method)`

Returns the arguments for the last matched call to fetch

#### `lastUrl(filter, method)`

Returns the url for the last matched call to fetch. When `fetch` was last called using a `Request` instance, the url will be extracted from this

#### `lastOptions(filter, method)`

Returns the options for the last matched call to fetch. When `fetch` was last called using a `Request` instance, a set of `options` inferred from the `Request` will be returned

#### `flush()`

Returns a `Promise` that resolves once all fetches handled by fetch-mock have resolved. Pass in `true` to wait for all response methods (`res.json()`, `res.text()`, etc.) to resolve too. Useful for testing code that uses `fetch` but doesn't return a promise.

## Config

On either the global or sandboxed `fetchMock` instances, the following config options can be set by setting properties on `fetchMock.config`. Many can also be set on individual calls to `.mock()`.

- `sendAsJson` [default `true`] - by default fetchMock will convert objects to JSON before sending. This is overrideable from each call but for some scenarios e.g. when dealing with a lot of array buffers, it can be useful to default to `false`
- `includeContentLength` [default `true`]: When set to true this will make fetchMock automatically add the `content-length` header. This is especially useful when combined with `sendAsJson` because then fetchMock does the conversion to JSON for you and knows the resulting length so you don’t have to compute this yourself by basically doing the same conversion to JSON.
- `fallbackToNetwork` [default `false`] If true then unmatched calls will transparently fall through to the network, if false an error will be thrown. If set to `always`, all calls will fall through, effectively disabling fetch-mock. to Within individual tests `.catch()` and `spy()` can be used for fine-grained control of this
- `overwriteRoutes`: If a new route clashes with an existing route, setting `true` here will overwrite the clashing route, `false` will add another route to the stack which will be used as a fallback (useful when using the `repeat` option). Adding a clashing route without specifying this option will throw an error.
- `warnOnFallback` [default `true`] If true then any unmatched calls that are caught by a fallback handler (either the network or a custom function set using `catch()`) will emit warnings
- `Headers`,`Request`,`Response`,`Promise`, `fetch`
  When using non standard fetch (e.g. a ponyfill, or aversion of `node-fetch` other than the one bundled with `fetch-mock`) or an alternative Promise implementation, this will configure fetch-mock to use your chosen implementations.

Note that `Object.assign(fetchMock.config, require('fetch-ponyfill')())` will configure fetch-mock to use all of fetch-ponyfill's classes. In most cases, it should only be necessary to set this once before any tests run.
