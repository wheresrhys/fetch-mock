# fetch-mock [![Build Status](https://travis-ci.org/wheresrhys/fetch-mock.svg?branch=master)](https://travis-ci.org/wheresrhys/fetch-mock)
Mock http requests made using fetch (or [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)). As well as shorthand methods for the simplest use cases, it offers a flexible API for customising all aspects of 	mocking behaviour.

## Installation and usage

`npm install fetch-mock` then `require('fetch-mock')` in most environments.

[Troubleshooting and alternative installation](#troubleshooting-and-alternative-installation), [V4 changelog](#v4-changelog)

## Basic usage

**`require('fetch-mock')` exports a singleton with the following methods**

#### `mock(matcher, response)` or `mock(matcher, method, response)`
Replaces `fetch()` with a stub which records its calls, grouped by route, and optionally returns a mocked `Response` object or passes the call through to `fetch()`. Calls to `.mock()` can be chained.

* `matcher` [required]: Condition for selecting which requests to mock Accepts any of the following
	* `string`: Either an exact url to match e.g. 'http://www.site.com/page.html' or, if the string begins with a `^`, the string following the `^` must begin the url e.g. '^http://www.site.com' would match 'http://www.site.com' or 'http://www.site.com/page.html'
	* `RegExp`: A regular  expression to test the url against
	* `Function(url, opts)`: A function (returning a Boolean) that is passed the url and opts `fetch()` is called with (or, if `fetch()` was called with one, the `Request` instance)
* `method` [optional]: only matches requests using this http method
* `response` [required]: Configures the http response returned by the mock. Can take any of the following values (or be a `Promise` for any of them, enabling full control when testing race conditions etc.)
	* `number`: Creates a response with this status
	* `string`: Creates a 200 response with the string as the response body
	* `object`: As long as the object does not contain any of the properties below it is converted into a json string and returned as the body of a 200 response. If any of the properties below are defined it is used to configure a `Response` object
		* `body`: Set the response body (`string` or `object`)
		* `status`: Set the response status (defaut `200`)
		* `headers`: Set the response headers. (`object`)
		* `throws`: If this property is present then a `Promise` rejected with the value of `throws` is returned
		* `sendAsJson`: This property determines whether or not the request body should be JSON.stringified before being sent (defaults to true).
	* `Function(url, opts)`: A function that is passed the url and opts `fetch()` is called with and that returns any of the responses listed above (or a `Promise` for any of them)

#### `restore()`
Restores `fetch()` to its unstubbed state and clears all data recorded for its calls

#### `reMock()`
Calls `restore()` internally then calls `mock()`. This allows you to put some generic calls to `mock()` in a `beforeEach()` while retaining the flexibility to vary the responses for some tests. `reMock()` can be chained.

#### `reset()`
Clears all data recorded for `fetch()`'s calls

*Note that `restore()`, `reMock()` and `reset()` are all bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.restore)` will work just fine. There is no need for `afterEach(function () {fetchMock.restore()})`*

**For the methods below `matcherName`, if given, should be either the name of a route (see advanced usage below) or equal to `matcher.toString()` for any unnamed route**

#### `calls(matcherName)`
Returns an object `{matched: [], unmatched: []}` containing arrays of all calls to fetch, grouped by whether fetch-mock matched them or not. If `matcherName` is specified then only calls to fetch matching that route are returned.

#### `called(matcherName)`
Returns a Boolean indicating whether fetch was called and a route was matched. If `matcherName` is specified it only returns `true` if that particular route was matched.

#### `lastCall(matcherName)`
Returns the arguments for the last matched call to fetch

#### `lastUrl(matcherName)`
Returns the url for the last matched call to fetch

#### `lastOptions(matcherName)`
Returns the options for the last matched call to fetch

##### Example

```js
fetchMock
	.mock('http://domain1', 200)
	.mock('http://domain2', 'PUT', {
		affectedRecords: 1
	});

myModule.onlyCallDomain2()
	.then(() => {
		expect(fetchMock.called('http://domain2')).to.be.true;
		expect(fetchMock.called('http://domain1')).to.be.false;
		expect(fetchMock.calls().unmatched.length).to.equal(0);
		expect(JSON.parse(fetchMock.lastUrl('http://domain2'))).to.equal('http://domain2/endpoint');
		expect(JSON.parse(fetchMock.lastOptions('http://domain2').body)).to.deep.equal({prop: 'val'});
	})
	.then(fetchMock.restore)
```

## Advanced usage

#### `mock(routeConfig)`

Use a configuration object to define a route to mock.
* `name` [optional]: A unique string naming the route. Used to subsequently retrieve references to the calls, grouped by name. If not specified defaults to `matcher.toString()` *Note: If a non-unique name is provided no error will be thrown (because names are optional, so auto-generated ones may legitimately clash)*
* `method` [optional]: http method
* `matcher` [required]: as specified above
* `response` [required]: as specified above

#### `mock(routes)`
Pass in an array of route configuration objects

#### `mock(config)`

Pass in an object containing more complex config for fine grained control over every aspect of mocking behaviour. May have the following properties
* `routes`: Either a single route config object or an array of them (see above).
* `greed`: Determines how the mock handles unmatched requests
	* 'none': all unmatched calls get passed through to `fetch()`
	* 'bad': all unmatched calls result in a rejected promise
	* 'good': all unmatched calls result in a resolved promise with a 200 status

#### *deprecated* `useNonGlobalFetch(func)`
When using isomorphic-fetch or node-fetch ideally `fetch` should be added as a global. If not possible to do so you can still use fetch-mock in combination with [mockery](https://github.com/mfncooper/mockery) or similar in nodejs. To use fetch-mock with with [mockery](https://github.com/mfncooper/mockery) you may use this function to prevent fetch-mock trying to mock the function globally.
* `func` Optional reference to `fetch` (or any other function you may want to substitute for `fetch` in your tests). This will probably have zero effect on your tests unless you are deliberately using the `greed: 'none'` config option to let some requests pass through to the original `fetch` implementation

## Troubleshooting and alternative installation

### `fetch` is assigned to a local variable, not a global

First of all, consider whether you could just use `fetch` as a global. Here are 3 reasons why this is a good idea:
- The `fetch` standard defines it as a global (and in some cases it won't work unless bound to `window`), so to write isomorphic code it's probably best to stick to this pattern
- [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch) takes care of installing it as a global in nodejs or the browser, so there's no effort on your part to do so.
- `fetch-mock` is primarily designed to work with `fetch` as a global and your experience of using it will be far more straightforward if you follow this pattern

Still not convinced?

In that case `fetchMock.fetchMock` (or *[deprecated]* call `getMock()`) gives you access to the mock implementation of `fetch` which you can pass in to a mock loading library such as [`mockery`](https://www.npmjs.com/package/mockery)

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
If using a mock loading library such as `mockery`, are you requiring the module you're testing after registering `fetch-mock` with the mock loader? You probably should be ([Example incorrect usage](https://github.com/wheresrhys/fetch-mock/issues/70)). If you're using ES6 `import` it may not be possible to do this without reverting to using `require()` sometimes. I *did* warn you about not using `fetch` as a global (...sigh)

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

## V4 changelog
* `registerRoute()` and `unregisterRoute()` have been removed to simplify the API. Since V3, calls to `.mock()` can be chained, so persisting routes over a series of tests can easily be achieved by means of a beforeEach or helper e.g.

```js
beforeEach(() => {
	fetchMock
		.mock('http://auth.service.com/user', 200)
		.mock('http://mvt.service.com/session', {test1: true, test2: false})
});

afterEach(() => {
	fetchMock.restore();
});

it('should be possible to augment persistent set of routes', () => {
	fetchMock.mock('http://content.service.com/contentid', {content: 'blah blah'})
	page.init();
	expect(fetchMock.called('http://content.service.com/contentid')).to.be.true;
});
```
* Defining two routes with the same name will no longer throw an error (previous implementation was buggy anyway)
* Added `lastCall()`, `lastUrl()` and `lastOptions()` utilities
