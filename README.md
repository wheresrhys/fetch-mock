# fetch-mock [![Build Status](https://travis-ci.org/wheresrhys/fetch-mock.svg?branch=master)](https://travis-ci.org/wheresrhys/fetch-mock) [![Coverage Status](https://coveralls.io/repos/wheresrhys/fetch-mock/badge.svg)](https://coveralls.io/r/wheresrhys/fetch-mock)
Mock http requests made using fetch (or isomorphic-fetch)

*notes* 
- When using isomorphic-fetch or node-fetch fetch should be added as a global 
- fetch-mock doesn't declare fetch or Promise as dependencies; as you're testing `fetch` it's assumed you're already taking care of these globals
- If you prefer documentation by example skip to the bottom of this README

## API

`require('fetch-mock')` exports a singleton with the following methods

### `mock(config)`
Replaces `fetch()` with a sinon stub which, in addition to the default sinon behaviour, records each of its calls and optionally returns a stub response or passes the call through to `fetch()`. `config` is an optional* object with the following properties. 

* `routes`: Either a single object or an array of similar objects each defining how the mock handles a given request. Each route object must have the following properties. If multiple routes are specified the first matching route will be used to define the response
	* `name`: A unique string naming the route
	* `matcher`: The rule for matching calls to `fetch()`. Accepts any of the following
		* `string`: Either an exact url to match e.g. 'http://www.site.com/page.html' or, if the string begins with a `^`, the string following the `^` must begin the url e.g. '^http://www.site.com' would match 'http://www.site.com' or 'http://www.site.com/page.html'
		* `RegExp`: A regular  expression to test the url against
		* `Function(url, opts)`: A function that is passed the url and opts `fetch` is called with and that returns a Boolean
	* `response`: Configures the response object returned by the mock. Can take any of the following values
		* `string`: creates a 200 response with the string as the response body
		* `object`: If the object contains any of the properties body, status, headers, throws; then these properties - all of them optional - are used to construct a response as follows
			* `body`: Retunred in the response body
			* `status`: Returned in the response status
			* `headers`: Returned in the response headers. They should be defined as an object literal (property names case-insensitive) which will be converted to a `Headers` instance
			* `throws`: If this property is present then a `Promise` rejected with the value of `throws` is returned
		
			As long as the object does not contain any of the above properties it is converted into a json string and this is returned as the body of a 200 response
		* `Function(url, opts)`: A function that is passed the url and opts `fetch()` is called with and that returns any of the responses listed above
* `responses`: When `registerRoute()` has already been used to register some routes then `responses` can be used to override the default response. Its value should be an object mapping route names to responses, which should be similar to those listed immediately above e.g. 

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

* `greed`: Determines how the mock handles unmatched requests
	* 'none': all unmatched calls get passed through to `fetch()`
	* 'bad': all unmatched calls result in a rejected promise
	* 'good': all unmatched calls result in a resolved promise with a 200 status


\* `config` is optional only when preconfigured routes have already been setup


### `restore()`
Restores `fetch()` to its unstubbed state and clears all data recorded for its calls

### `reset()`
Clears all data recorded for `fetch()`'s calls

### `calls(routeName)`
Returns an array of arrays of the arguments passed to `fetch()` that matched the given route

### `called(routeName)`
Returns a Boolean denoting whether any calls matched the given route

### `reMock()` 
Normally calling `mock()` twice without restoring inbetween will throw an error. `reMock()` calls `restore()` internally before calling `mock()` again. This allows you to put a generic call to `mock()` in a `beforeEach()` while retaining the flexibility to vary the responses for some tests

### `registerRoute(name, matcher, response)`
Often your application/module will always need responses for some calls in order to initialise properly, even if the content of those calls are not the subject of a given test e.g. a mock response from an authentication service and a lti-variant testing service might be necessary in order to test the UI for a version of a log in form. It's helpful to be able to define some default responses for these services which will exist throughout all or a large subset of your tests. `registerRoute()` aims to fulfil this need. All these predefined routes can be overridden when `mock(config)` is called.

`registerRoute()` takes either of the following parameters
* `object`: An object similar to the route objects accepted by `mock()`
* `array`: An array of the above objects
* `name`, `matcher`, `response`: The 3 properties of the route object spread across 3 parameters

### `unregisterRoute(name)`
Unregisters one or more previously registered routes. Accepts either a string or an array of strings



## Example 
```javascript

var fetchMock = require('fetch-mock');

// Set up some routes you will always want to mock
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
		// I wonder what this does??
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
