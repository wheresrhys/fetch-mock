# fetch-mock
Mock http requests made using fetch (or isomorphic-fetch)

```javascript

var fetchMock = require('fetch-mock');

// Set up some routes you will always want to mock
// Accepts an array of config objects or three parameters,
// name, matcher and response, to add a single route
fetchMock.registerRoute([
 {
	 name: 'session',
	 matcher: 'https://sessionservice.host.com',
	 response: 'user-12345'
 },
 {
	 name: 'geo',
	 matcher: /^https\:\/\/geoservice\.host\.com/,
	 // objects will be converted to strings using JSON.stringify before being returned
	 response: {
		country: 'uk'
	 }
 }
])


it('should do A', function () {
	fetchMock.mock({
		// none: all unmatched calls get sent straight through to the default fetch
		// bad: all unmatched calls result in a rejected promise
		// good: all unmatched calls result in a resolved promise with a 200 status
		greedy: 'none' 
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
		}, 'I am an article');
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
				return 'enhanced-article-' + url.split('article-id/')[1];
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
