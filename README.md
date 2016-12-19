# fetch-mock [![Build Status](https://travis-ci.org/wheresrhys/fetch-mock.svg?branch=master)](https://travis-ci.org/wheresrhys/fetch-mock)
Mock http requests made using fetch (or [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)) in nodejs or the browser (including web workers and service workers)

As well as shorthand methods for the simplest use cases, it offers a flexible API for customising all aspects of mocking behaviour.

## Installation

Install with `npm install fetch-mock`.

* [Troubleshooting and alternative installation](#troubleshooting-and-alternative-installation)

## Quickstart
Here are some common use cases - see the full API docs below for advanced usage

### Setting up your mock

The commonest use case is `fetchMock.mock(matcher, response)`, where `matcher` is a string or regex to match and `response` is a statusCode, string or object literal. You can also use `fetchMock.once(url ...)` to limit to a single call or `fetchMock.get()`, `fetchMock.post()` etc. to limit to a method. All these methods are chainable so you can easily define several mocks in a single test.

### Analysing calls to your mock
`fetchMock.called(matcher)` reports if any calls matched your mock (or leave `matcher` out if you just want to check `fetch` was called at all). `fetchMock.lastCall()`, `fetchMock.lastUrl()` or `fetchMock.lastOptions()` give you access to the parameters last passed in to `fetch`. `fetchMock.done()` will tell you if `fetch` was called the expected number of times.

### Tearing down your mock
`fetchMock.reset()` resets the call history. `fetchMock.restore()` will also restore `fetch()` to its native implementation

### Example
Example with node: suppose we have a file `make-request.js` with a function that calls `fetch`:

```js
module.exports = function makeRequest() {
  return fetch("http://httpbin.org/get").then(function(response) {
    return response.json();
  });
};
```

We can use fetch-mock to patch `fetch`. In `patched.js`:

```js
var fetchMock = require('fetch-mock');
var makeRequest = require('./make-request');

// Patch the fetch() global to always return the same value for GET
// requests to all URLs.
fetchMock.get('*', {hello: 'world'});

makeRequest().then(function(data) {
  console.log(['got data', data]);
});

// Unpatch.
fetchMock.restore();
```

Result:

```bash
$ node patched.js
[ 'got data', { hello: 'world' } ]
```

## API

* [V4 - V5 upgrade guide](https://github.com/wheresrhys/fetch-mock/blob/master/V4_V5_UPGRADE_NOTES.md)
* [V4 docs](https://github.com/wheresrhys/fetch-mock/blob/95d79052efffef5c80b3d87d5050392293e1bfaa/README.md)

### Mocking calls to `fetch`

##### `mock(matcher, response, options)` or `mock(options)`
Replaces `fetch()` with a stub which records its calls, grouped by route, and optionally returns a mocked `Response` object or passes the call through to `fetch()`. Calls to `.mock()` can be chained.

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
	* `Function(url, opts)`: A function that is passed the url and opts `fetch()` is called with and that returns any of the responses listed above (or a `Promise` for any of them)
* `options`: A configuration object with all/additional properties to define a route to mock
	* `name`: A unique string naming the route. Used to subsequently retrieve references to the calls, grouped by name. If not specified defaults to `matcher.toString()` *Note: If a non-unique name is provided no error will be thrown (because names are optional, so auto-generated ones may legitimately clash)*
	* `method`: http method to match
	* `headers`: key/value map of headers to match
	* `matcher`: as specified above
	* `response`: as specified above
	* `times`: An integer, `n`, limiting the number of times the matcher can be used. If the route has already been called `n` times the route will be ignored and the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)

##### `once()`
Shorthand for `mock()` which limits to being called one time only. (see `times` option above)

##### `get()`, `post()`, `put()`, `delete()`, `head()`, `patch()`
Shorthands for `mock()` restricted to a particular method *Tip: if you use some other method a lot you can easily define your own shorthands e.g.:*

```
fetchMock.purge = function (matcher, response, options) {
	return this.mock(matcher, response, Object.assign({}, options, {method: 'PURGE'}));
}

```

##### `getOnce()`, `postOnce()`, `putOnce()`, `deleteOnce()`, `headOnce()`, `patchOnce()`
Shorthands for `mock()` restricted to a particular method and that can only be called one time only

##### `catch(response)`
This is used to define how to respond to calls to fetch that don't match any of the defined mocks. It accepts the same types of response as a normal call to `.mock(matcher, response)`. It can also take an arbitrary function to completely customise behaviour of unmatched calls. It is chainable and can be called before or after other calls to `.mock()`. If `.catch() ` is called without any parameters then every unmatched call will receive a `200` response e.g.

```
fetchMock
	.mock('http://my-api.com', 200)
	.catch(503)
```

##### `spy()`
Similar to `catch()`, this records the call history of unmatched calls, but instead of responding with a stubbed response, the request is passed through to native `fetch()` and is allowed to communicate over the network.

##### `sandbox(Promise)` *experimental*
This returns a drop-in mock for fetch which can be passed to other mocking libraries. It implements the full fetch-mock api and maintains its own state independent of other instances, so tests can be run in parallel. e.g.

```
	fetchMock.sandbox().mock('http://domain.com', 200)
```

`sandbox()` can optionally be passed a custom promise implementation. If not provided, the `Promise` global is used.

##### `restore()`
Chainable method that restores `fetch()` to its unstubbed state and clears all data recorded for its calls.

##### `reset()`
Chainable method that clears all data recorded for `fetch()`'s calls

*Note that `restore()` and `reset()` are both bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.restore)` will work just fine. There is no need for `afterEach(function () {fetchMock.restore()})`*

### Analysing how `fetch()` has been called

**For the methods below `matcherName`, if given, should be either the name of a route (see advanced usage below) or equal to `matcher.toString()` for any unnamed route. You _can_ pass in the original regex or function used as a matcher, but they will be converted to strings and used to look up values in fetch-mock's internal maps of calls, rather than used as regexes or functions**

##### `called(matcherName)`
Returns a Boolean indicating whether fetch was called and a route was matched. If `matcherName` is specified it only returns `true` if that particular route was matched.

##### `done(matcherName)`
Returns a Boolean indicating whether fetch was called the expected number of times (or at least once if the route defines no expectation is set for the route). If no `matcherName` is passed it returns `true` if every route has been called the number of expected times.

##### `calls(matcherName)`
Returns an object `{matched: [], unmatched: []}` containing arrays of all calls to fetch, grouped by whether fetch-mock matched them or not. If `matcherName` is specified then only calls to fetch matching that route are returned.

##### `lastCall(matcherName)`
Returns the arguments for the last matched call to fetch

##### `lastUrl(matcherName)`
Returns the url for the last matched call to fetch

##### `lastOptions(matcherName)`
Returns the options for the last matched call to fetch

### Utilities

##### `configure(opts)`
Set some global config options, which include
* `sendAsJson` [default `true`] - by default fetchMock will convert objects to JSON before sending. This is overrideable fro each call but for some scenarios e.g. when dealing with a lot of array buffers, it can be useful to default to `false`

## Troubleshooting and alternative installation

### `fetch` is assigned to a local variable, not a global

First of all, consider whether you could just use `fetch` as a global. Here are 3 reasons why this is a good idea:
- The `fetch` standard defines it as a global (and in some cases it won't work unless bound to `window`), so to write isomorphic code it's probably best to stick to this pattern
- [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch) takes care of installing it as a global in nodejs or the browser, so there's no effort on your part to do so.
- `fetch-mock` is primarily designed to work with `fetch` as a global and your experience of using it will be far more straightforward if you follow this pattern

Still not convinced?

In that case `fetchMock.fetchMock` gives you access to the mock implementation of `fetch` which you can pass in to a mock loading library such as [`mockery`](https://www.npmjs.com/package/mockery)

##### Mockery example
```js
var fetch = require('node-fetch');
var fetchMock = require('fetch-mock');
var mockery = require('mockery');

it('should make a request', function (done) {
	mockery.registerMock('node-fetch', fetchMock.fetchMock);
	fetchMock.mock('http://domain.com/', 200)
	const myModule = require('./src/my-mod'); // this module requires node-fetch and assigns to a variable
	// test code goes in here
	mockery.deregisterMock('fetch');
	done();
});
```
### `fetch` doesn't seem to be getting mocked?
* If using a mock loading library such as `mockery`, are you requiring the module you're testing after registering `fetch-mock` with the mock loader? You probably should be ([Example incorrect usage](https://github.com/wheresrhys/fetch-mock/issues/70)). If you're using ES6 `import` it may not be possible to do this without reverting to using `require()` sometimes. I *did* warn you about not using `fetch` as a global (...sigh)
* If using `isomorphic-fetch` in your source, are you assigning it to a `fetch` variable? You *shouldn't* be i.e. 
  * `import 'isomorphic-fetch'`, not `import fetch from 'isomorphic-fetch'`
  * `require('isomorphic-fetch')`, not `const fetch = require('isomorphic-fetch')`

### Environment doesn't support requiring fetch-mock?
* If your client-side code or tests do not use a loader that respects the browser field of package.json use `require('fetch-mock/es5/client')`.
* If you need to use fetch-mock without commonjs, you can include the precompiled `node_modules/fetch-mock/es5/client-browserified.js` in a script tag. This loads fetch-mock into the `fetchMock` global variable.
* For server side tests running in nodejs 0.12 or lower use `require('fetch-mock/es5/server')`

### Matching `Request` objects in node fails
In node, if using npm at a version less than 2 the `Request` constructor used by `fetch-mock` won't necessarily be the same as the one used by `isomorphic-fetch`. To fix this upgrade to npm@3.

### Polyfilling fetch
* In nodejs `require('isomorphic-fetch')` before any of your tests.
* In the browser `require('isomorphic-fetch')` can also be used, but it may be easier to `npm install whatwg-fetch` (the module isomorphic-fetch is built around) and load `./node_modules/whatwg-fetch/fetch.js` directly into the page, either in a script tag or by referencing it your test runner config.
* When using karma-webpack it's best not to use the `webpack.ProvidePlugin` for this. Instead just add `node_modules/whatwg-fetch/fetch.js` to your list of files to include, or require it directly into your tests before requiring fetch-mock.
