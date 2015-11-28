# fetch-mock [![Build Status](https://travis-ci.org/wheresrhys/fetch-mock.svg?branch=master)](https://travis-ci.org/wheresrhys/fetch-mock) [![Coverage Status](https://coveralls.io/repos/wheresrhys/fetch-mock/badge.svg)](https://coveralls.io/r/wheresrhys/fetch-mock)
Mock http requests made using fetch (or [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)). As well as shorthand methods for the simplest use cases, it offers a flexible API for customising mocking behaviour, and can also be persisted (with resettable state) over a series of tests.

- [V3 changelog](https://github.com/wheresrhys/fetch-mock/pull/35)

## Which file to require
- Browser or nodejs 4 or higher `require('fetch-mock')`
- Browser tests when not using a loader that respects the `browser` field of package.json: `require('fetch-mock/es5/client')` 
- Server side tests running in nodejs 0.12 or lower: `require('fetch-mock/es5/server')`

You will need to ensure `fetch` and `Promise` are already available as globals in your environment

*To output useful messages for debugging `export DEBUG=fetch-mock`*

**`require('fetch-mock')`** exports a singleton with the following methods

## Basic usage

#### `mock(matcher, response)` or `mock(matcher, method, response)`  
Replaces `fetch()` with a stub which records it's calls, grouped by route, and optionally returns a mocked `Response` object or passes the call through to `fetch()`. Calls to `.mock()` can be chained.

* `matcher` [required]: Condition for selecting which requests to mock Accepts any of the following
	* `string`: Either an exact url to match e.g. 'http://www.site.com/page.html' or, if the string begins with a `^`, the string following the `^` must begin the url e.g. '^http://www.site.com' would match 'http://www.site.com' or 'http://www.site.com/page.html'
	* `RegExp`: A regular  expression to test the url against
	* `Function(url, opts)`: A function (returning a Boolean) that is passed the url and opts `fetch()` is called with.
* `method` [optional]: only matches requests using this http method
* `response` [required]: Configures the http response returned by the mock. Can take any of the following values
	* `number`: Creates a response with this status
	* `string`: Creates a 200 response with the string as the response body
	* `object`: As long as the object does not contain any of the properties below it is converted into a json string and returned as the body of a 200 response. If any of the properties below are defined it is used to configure a `Response` object
		* `body`: Set the response body (`string` or `object`)
		* `status`: Set the response status (defaut `200`)
		* `headers`: Set the response headers. (`object`)
		* `throws`: If this property is present then a `Promise` rejected with the value of `throws` is returned
	* `Function(url, opts)`: A function that is passed the url and opts `fetch()` is called with and that returns any of the responses listed above

##### Example

```
const fetchMock = require('fetch-mock');
fetchMock
	.mock('http://domain1', 200)
	.mock('http://domain2', 'DELETE', 204);
```

#### `restore()`
Restores `fetch()` to its unstubbed state and clears all data recorded for its calls

#### `reMock()`
Calls `restore()` internally then calls `mock()`. This allows you to put some generic calls to `mock()` in a `beforeEach()` while retaining the flexibility to vary the responses for some tests

#### `reset()`
Clears all data recorded for `fetch()`'s calls

#### `calls(matcher)`
Returns an object `{matched: [], unmatched: []}` containing arrays of all calls to fetch, grouped by whether fetch-mock matched them or not. If `matcher` is specified and is equal to `matcher.toString()` for any of the mocked routes then only calls to fetch matching that route are returned.

#### `called(matcher)`
Returns a Boolean indicating whether fetch was called and a route was matched. If `matcher` is specified and is equal to `matcher.toString()` for any of the mocked routes then only returns `true` if that particular route was matched.
		
## Advanced usage

#### `mock(routeConfig)`

Use a configuration object to define a route to mock.
	* `name` [optional]: A unique string naming the route. Used to subsequently retrieve references to the calls, grouped by name. If not specified defaults to `matcher.toString()`
	* `method` [optional]: http method
	* `matcher` [required]: as specified above
	* `response` [required]: as specified above

#### `mock(routes)`
Pass in an array of route configuration objects

#### `mock(config)`
Pas in an object containing more complex config for fine grained control over every aspect of mocking behaviour. May have the following properties
	- `routes`: Either a single route config object or an array of them (see above)
	- `responses`: When `registerRoute()` (see below) has already been used to register some routes then `responses` can be used to override the default response. Its value should be an object mapping route names to responses, which should be similar to those provided in the `response` property of stanadard route configurations e.g.

	```javascript
	  responses: {
	  	session: function (url, opts) {
	  		if (opts.headers.authorized) {
	  			return {user: 'dummy-authorized-user'};
	  		} else {
	  			return {user: 'dummy-unauthorized-user'};
	  		}
	  	}
	  }
	```

	- `greed`: Determines how the mock handles unmatched requests
		- 'none': all unmatched calls get passed through to `fetch()`
		- 'bad': all unmatched calls result in a rejected promise
		- 'good': all unmatched calls result in a resolved promise with a 200 status

#### `calls(routeName)`
Returns an array of arrays of the arguments passed to `fetch()` that matched the given route.

#### `called(routeName)`
Returns a Boolean denoting whether any calls matched the given route. 

#### `registerRoute()`
Often your application/module will need a mocked response for some http requests in order to initialise properly, even if the content of those calls are not the subject of a given test e.g. a mock response from an authentication service and a multi-variant testing service might be necessary in order to test the UI for a version of a log in form. It's helpful to be able to define some default responses for these services which will exist throughout all or a large subset of your tests. `registerRoute()` aims to fulfil this need. All these predefined routes can be overridden when `mock(config)` is called.

* `registerRoute(object)`: An object similar to the route objects accepted by `mock()`
* `registerRoute(array)`: An array of the above objects
* `registerRoute(name, matcher, response)`: The 3 properties of the route object spread across 3 parameters

#### `unregisterRoute(name)`
Unregisters one or more previously registered routes. Accepts either a string or an array of strings

#### `useNonGlobalFetch(func)`
When using isomorphic-fetch or node-fetch ideally `fetch` should be added as a global. If not possible to do so you can still use fetch-mock in combination with [mockery](https://github.com/mfncooper/mockery) in nodejs. To use fetch-mock with with [mockery](https://github.com/mfncooper/mockery) you will need to use this function to prevent fetch-mock trying to mock the function globally.
* `func` Optional reference to `fetch` (or any other function you may want to substitute for `fetch` in your tests).

Since fetch-mock v3 calls to `mock()` are chainable, so to obtain a reference to the mocked fetch call `getMock()`.

##### Mockery example
```javascript
var fetch = require('node-fetch');
var fetchMock = require('fetch-mock');
var mockery = require('mockery');
fetchMock.useNonGlobalFetch(fetch);

fetchMock.registerRoute([
 ...
])
it('should make a request', function (done) {
	mockery.registerMock('fetch', fetchMock.mock().getMock());
	// test code goes in here
	mockery.deregisterMock('fetch');
	done();
});
```

## Examples
```javascript

var fetchMock = require('fetch-mock');

// Simplest use case
it('should pretend to be Rambo', done => {
	fetchMock.mock('http://rambo.was.ere', 301);
	fetch('http://rambo.was.ere')
		.then(res => {
			expect(fetchMock.calls().length).to.equal(1);
			expect(res.status).to.equal(301);
			fetchMock.restore();
			done();
		});
})

// Optionally set up some routes you will always want to mock
// Accepts an array of config objects or three parameters,
// name, matcher and response, to add a single route
fetchMock.registerRoute([
 {
	 name: 'session',
	 matcher: 'https://sessionservice.host.com',
	 response: {
	 	body: 'user-12345',
	 	// opts is as expected by https://github.com/bitinn/node-fetch/blob/master/lib/response.js
	 	// headers should be passed as an object literal (fetch-mock will convert it into a Headers instance)
	 	// status defaults to 200
	 	opts: {
	 		headers: {
	 			'x-status': 'unsubscribed'
	 		},
	 		status: 401
	 	}
	 }
 },
 {
	name: 'geo',
	matcher: /^https\:\/\/geoservice\.host\.com/,
	// objects will be converted to strings using JSON.stringify before being returned
	response: {
	 	body: {
			country: 'uk'
		}
	}
 }
])


it('should do A', function () {
	fetchMock.mock({
		// none: all unmatched calls get sent straight through to the default fetch
		// bad: all unmatched calls result in a rejected promise
		// good: all unmatched calls result in a resolved promise with a 200 status
		greed: 'none'
	});

	thingToTest.exec();

	// returns an array of calls to the session service,
	// each item in the array is an array of the arguments passed to fetch
	// similar to sinon.spy.args
	fetchMock.calls('session') // non empty array
	fetchMock.called('geo') // Boolean

	// reset all call logs
	fetchMock.reset()

	fetchMock.calls('session') // undefined
	fetchMock.called('geo') // false

	// fetch itself is just an ordinary sinon.stub
	fetch.calledWith('thing')

	// restores fetch and resets all data
	fetchMock.restore();
})

describe('content', function () {
	before(function () {
		// register an additional route, this one has a more complex matching rule
		fetchMock.registerRoute('content', function (url, opts) {
			return opts.headers.get('x-api-key') && url.test(/^https\:\/\/contentservice\.host\.com/);
		}, {body: 'I am an article'});
	});

	after(function () {
		fetchMock.unregisterRoute('content');
	})

	it('should do B', function () {


		fetchMock.mock({
			// you can choose to mock a subset of the registered routes
			// and even add one to be mocked for this test only
			// - the route will exist until fetchMock.restore() is called
			routes: ['session', 'content', {
			 name: 'enhanced-content',
			 matcher: /^https\:\/\/enhanced-contentservice\.host\.com/,
			 // responses can be contextual depending on the request
			 // url and opts parameters are exactly what would be passed to fetch
			 response: function (url, opts) {
				return {body: 'enhanced-article-' + url.split('article-id/')[1]};
			 }
			}]
		});

		thingToTest.exec();

		fetchMock.calls('content') // non empty array
		fetchMock.called('enhanced-content') // Boolean

		// restores fetch and resets all data
		fetchMock.restore();
	})

	it('should do C', function () {


		fetchMock.mock({
			// you can override the response for a service for this test only
			// this means e.g. you can configure an authentication service to return
			// a valid user normally, but only return invalid for the one test
			// where you're testing authentication
			responses: {
				'session': 'invalid-user'
			}
		});

		thingToTest.exec();

		// restores fetch and resets all data
		fetchMock.restore();
	})

});
```

