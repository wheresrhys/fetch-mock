- [Introduction](/fetch-mock)
- [Quickstart](/fetch-mock/quickstart)
- [Installation and usage](/fetch-mock/installation)
- API documentation
- [Troubleshooting](/fetch-mock/troubleshooting)
- [Examples](/fetch-mock/examples)

# API Documentation

* [V4 - V5 upgrade guide](https://github.com/wheresrhys/fetch-mock/blob/master/V4_V5_UPGRADE_NOTES.md)
* [V4 docs](https://github.com/wheresrhys/fetch-mock/blob/95d79052efffef5c80b3d87d5050392293e1bfaa/README.md)

## Mocking calls to `fetch`

#### `mock(matcher, response, options)` or `mock(options)`
Replaces `fetch()` with a stub which records its calls, grouped by route, and optionally returns a mocked `Response` object or passes the call through to `fetch()`. Calls to `.mock()` can be chained. *Note that once mocked, `fetch` will error on any unmatched calls. Use `.spy()` or `.catch()` to handle unmocked calls more gracefully*

* `matcher`: Condition for selecting which requests to mock Accepts any of the following
    * `string`: Either
        * an exact url to match e.g. 'http://www.site.com/page.html'
        * '*' to match any url
        * `begin:http://www.site.com/` to match urls beginning with a string
        * `end:.jpg` to match urls ending with a string
        * `glob:http://*.*` to match glob patterns
        * `express:/user/:user` to match [express style paths](https://www.npmjs.com/package/path-to-regexp)
        * [deprecated] if the string begins with a `^`, the string following the `^` must begin the url e.g. '^http://www.site.com' would match 'http://www.site.com' or 'http://www.site.com/page.html'
    * `RegExp`: A regular  expression to test the url against
    * `Function(url, opts)`: A function (returning a Boolean) that is passed the url and opts `fetch()` is called with (or, if `fetch()` was called with one, the `Request` instance)
* `response`: Configures the http response returned by the mock. Can take any of the following values (or be a `Promise` for any of them, enabling full control when testing race conditions etc.)
    * `Response`: A `Response` instance - will be used unaltered
    * `number`: Creates a response with this status
    * `string`: Creates a 200 response with the string as the response body
    * `object`: As long as the object does not contain any of the properties below it is converted into a json string and returned as the body of a 200 response. If any of the properties below are defined it is used to configure a `Response` object
        * `body`: Set the response body (`string` or `object`)
        * `status`: Set the response status (default `200`)
        * `headers`: Set the response headers. (`object`)
        * `throws`: If this property is present then a `Promise` rejected with the value of `throws` is returned
        * `sendAsJson`: This property determines whether or not the request body should be JSON.stringified before being sent (defaults to true).
        * `includeContentLength`: Set this property to true to automatically add the `content-length` header (defaults to false).
    * `Function(url, opts)`: A function that is passed the url and opts `fetch()` is called with and that returns any of the responses listed above (or a `Promise` for any of them)
* `options`: A configuration object with all/additional properties to define a route to mock
    * `name`: A unique string naming the route. Used to subsequently retrieve references to the calls, grouped by name. If not specified defaults to `matcher.toString()` *Note: If a non-unique name is provided no error will be thrown (because names are optional, so auto-generated ones may legitimately clash)*
    * `method`: http method to match
    * `headers`: key/value map of headers to match
    * `matcher`: as specified above
    * `response`: as specified above
    * `__redirectUrl`: *experimental* the url the response should be from (to imitate followed redirects - will set `redirected: true` on the response)
    * `times`: An integer, `n`, limiting the number of times the matcher can be used. If the route has already been called `n` times the route will be ignored and the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)

#### `once()`
Shorthand for `mock()` which limits to being called one time only. (see `times` option above)

#### `get()`, `post()`, `put()`, `delete()`, `head()`, `patch()`
Shorthands for `mock()` restricted to a particular method *Tip: if you use some other method a lot you can easily define your own shorthands e.g.:*

```
fetchMock.purge = function (matcher, response, options) {
    return this.mock(matcher, response, Object.assign({}, options, {method: 'PURGE'}));
}

```

#### `getOnce()`, `postOnce()`, `putOnce()`, `deleteOnce()`, `headOnce()`, `patchOnce()`
Shorthands for `mock()` restricted to a particular method and that can only be called one time only

#### `catch(response)`
This is used to define how to respond to calls to fetch that don't match any of the defined mocks. It accepts the same types of response as a normal call to `.mock(matcher, response)`. It can also take an arbitrary function to completely customise behaviour of unmatched calls. It is chainable and can be called before or after other calls to `.mock()`. If `.catch() ` is called without any parameters then every unmatched call will receive a `200` response e.g.

```
fetchMock
    .mock('http://my-api.com', 200)
    .catch(503)
```

#### `spy()`
Similar to `catch()`, this records the call history of unmatched calls, but instead of responding with a stubbed response, the request is passed through to native `fetch()` and is allowed to communicate over the network.

#### `sandbox(Promise)` *experimental*
This returns a drop-in mock for fetch which can be passed to other mocking libraries. It implements the full fetch-mock api and maintains its own state independent of other instances, so tests can be run in parallel. e.g.

```
    fetchMock.sandbox().mock('http://domain.com', 200)
```

`sandbox()` can optionally be passed a custom promise implementation. If not provided, the `Promise` global is used.

#### `flush()`
Returns a promise that resolves once all fetches handled by fetch-mock have resolved. Useful for testing code that uses `fetch` but doesn't return a promise.

#### `restore()`
Chainable method that restores `fetch()` to its unstubbed state and clears all data recorded for its calls.

#### `reset()`
Chainable method that clears all data recorded for `fetch()`'s calls

*Note that `restore()` and `reset()` are both bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.restore)` will work just fine. There is no need for `afterEach(function () {fetchMock.restore()})`*

## Analysing how `fetch()` has been called

**For the methods below `matcherName`, if given, should be either the name of a route (see advanced usage below) or equal to `matcher.toString()` for any unnamed route. You _can_ pass in the original regex or function used as a matcher, but they will be converted to strings and used to look up values in fetch-mock's internal maps of calls, rather than used as regexes or functions**

#### `called(matcherName)`
Returns a Boolean indicating whether fetch was called and a route was matched. If `matcherName` is specified it only returns `true` if that particular route was matched.

#### `done(matcherName)`
Returns a Boolean indicating whether fetch was called the expected number of times (or at least once if the route defines no expectation is set for the route). If no `matcherName` is passed it returns `true` if every route has been called the number of expected times.

#### `calls(matcherName)`
Returns an object `{matched: [], unmatched: []}` containing arrays of all calls to fetch, grouped by whether fetch-mock matched them or not. If `matcherName` is specified then only calls to fetch matching that route are returned.

#### `lastCall(matcherName)`
Returns the arguments for the last matched call to fetch

#### `lastUrl(matcherName)`
Returns the url for the last matched call to fetch

#### `lastOptions(matcherName)`
Returns the options for the last matched call to fetch

## Utilities

#### `configure(opts)`
Set some global config options, which include
* `sendAsJson` [default `true`] - by default fetchMock will convert objects to JSON before sending. This is overrideable from each call but for some scenarios e.g. when dealing with a lot of array buffers, it can be useful to default to `false`
* `includeContentLength` [default `false`]: When set to true this will make fetchMock automatically add the `content-length` header. This is especially useful when combined with `sendAsJson` because then fetchMock does the conversion to JSON for you and knows the resulting length so you don’t have to compute this yourself by basically doing the same conversion to JSON.

#### `setImplementations(opts)`
When using non global fetch (e.g. a ponyfill) or an alternative Promise implementation, this will configure fetch-mock to use your chosen implementations. `opts` is an object with one or more of the following properties: `Headers`,`Request`,`Response`,`Promise`. Note that `setImplementations(require('fetch-ponyfill')())` will configure fetch-mock to use all of fetch-ponyfill's classes. `setImplementations()` shoul, in most cases, be called only once, before any tests run.

