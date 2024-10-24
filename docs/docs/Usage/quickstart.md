---
sidebar_position: 2
---

# Quickstart

## Import fetch-mock

Use one of the following

```js
import fetchMock from 'fetch-mock';
```

```js
const fetchMock = require('fetch-mock');
```

## Mocking fetch

Use the following to replace `fetch` with fetch-mock's implementation of the `fetch` API.

```js
fetchMock.mockGlobal();
```

## Setting up your route

The commonest use case is `fetchMock.route(matcher, response, name)`, where `matcher` is an exact url to match, and `response` is a status code, string or object literal. Optionally you can pass a name for your route as the third parameter. There are many other options for defining your matcher or response, [route documentation](/fetch-mock/docs/API/route/).

You can also use `fetchMock.once()` to limit to a single call or `fetchMock.get()`, `fetchMock.post()` etc. to limit to a method.

All these methods are chainable so you can easily define several routes in a single test.

```js
fetchMock
	.get('http://good.com/', 200, 'good get')
	.post('http://good.com/', 400, 'good post')
	.get('http://bad.com/', 500, 'bad get');
```

## Analysing calls to your mock

You can use the names you gave your routes to check if they have been called.

- `fetchMock.called(name)` reports if any calls were handled by your route. If you just want to check `fetch` was called at all then do not pass in a name.
- `fetchMock.lastCall(name)` will return a CallLog object that will give you access to lots of metadata about the call, including the original arguments passed in to `fetch`.
- `fetchMock.done()` will tell you if `fetch` was called the expected number of times.

```js
assert(fetchMock.called('good get'));
assertEqual(fetchMock.lastCall('good get').query['search'], 'needle');
```

## Tearing down your mock

- `fetchMock.clearHistory()` clears all the records of calls made to `fetch`.
- `fetchMock.removeRoutes()` removes all the routes set up.
- `fetchMock.unmockGlobal()` resets `fetch` to its original implementation.

## Example

Example with Node.js: suppose we have a file `make-request.js` with a function that calls `fetch`:

```js
export async function makeRequest() {
	const res = await fetch('http://example.com/my-url', {
		headers: {
			user: 'me',
		},
	});
	return res.json();
}
```

We can use fetch-mock to mock `fetch`. In `mocked.js`:

```js
import { makeRequest } from './make-request';
import fetchMock from 'fetch-mock';

// Mock the fetch() global to return a response
fetchMock.mockGlobal().get(
	'http://httpbin.org/my-url',
	{ hello: 'world' },
	{
		delay: 1000, // fake a slow network
		headers: {
			user: 'me', // only match requests with certain headers
		},
	},
);

const data = await makeRequest();
console.log('got data', data);

// Unmock
fetchMock.unmockGlobal();
```

Result:

```bash
$ node mocked.js
'got data' { hello: 'world' }
```
