# fetch-mock-jest

Wrapper around [fetch-mock](http://www.wheresrhys.co.uk/fetch-mock) - a comprehensive, isomorphic mock for the [fetch api](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) - which provides an interface that is more idiomatic when working in [jest](https://jestjs.io).

The example at the bottom of this readme demonstrates the intuitive API, but shows off only a fraction of fetch-mock's functionality. Features include:

- mocks most of the fetch API spec, even advanced behaviours such as streaming and aborting
- declarative matching for most aspects of a http request, including url, headers, body and query parameters
- shorthands for the most commonly used features, such as matching a http method or matching one fetch only
- support for delaying responses, or using your own async functions to define custom race conditions
- can be used as a spy to observe real network requests
- isomorphic, and supports either a global fetch instance or a locally required instanceg

# Requirements

fetch-mock-jest requires the following to run:

- [Node.js](https://Node.js.org/) 8+ for full feature operation
- [Node.js](https://Node.js.org/) 0.12+ with [limitations](http://www.wheresrhys.co.uk/fetch-mock/installation)
- [npm](https://www.npmjs.com/package/npm) (normally comes with Node.js)
- [jest](https://www.npmjs.com/package/jest) 25+ (may work with earlier versions, but untested)
- Either
  - [node-fetch](https://www.npmjs.com/package/node-fetch) when testing in Node.js. To allow users a choice over which version to use, `node-fetch` is not included as a dependency of `fetch-mock`.
  - A browser that supports the `fetch` API either natively or via a [polyfill/ponyfill](https://ponyfoo.com/articles/polyfills-or-ponyfills)

# Installation

`npm install -D fetch-mock-jest`

## global fetch

`const fetchMock = require('fetch-mock-jest')`

## node-fetch

```
jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())
const fetchMock = require('node-fetch')
```

# API

## Setting up mocks

Please refer to the [fetch-mock documentation](http://wheresrhys.co.uk/fetch-mock) and [cheatsheet](https://github.com/wheresrhys/fetch-mock/blob/master/docs/cheatsheet.md)

All jest methods for configuring mock functions are disabled as fetch-mock's own methods should always be used

## Inspecting mocks

All the built in jest function inspection assertions can be used, e.g. `expect(fetchMock).toHaveBeenCalledWith('http://example.com')`.

`fetchMock.mock.calls` and `fetchMock.mock.results` are also exposed, giving access to manually inspect the calls.

The following custom jest expectation methods, proxying through to `fetch-mock`'s inspection methods are also available. They can all be prefixed with the `.not` helper for negative assertions.

- `expect(fetchMock).toHaveFetched(filter, options)`
- `expect(fetchMock).toHaveLastFetched(filter, options)`
- `expect(fetchMock).toHaveNthFetched(n, filter, options)`
- `expect(fetchMock).toHaveFetchedTimes(n, filter, options)`
- `expect(fetchMock).toBeDone(filter)`

### Notes

- `filter` and `options` are the same as those used by [`fetch-mock`'s inspection methods](http://www.wheresrhys.co.uk/fetch-mock/#api-inspectionfundamentals)
- The obove methods can have `Fetched` replaced by any of the following verbs to scope to a particular method: + Got + Posted + Put + Deleted + FetchedHead + Patched

e.g. `expect(fetchMock).toHaveLastPatched(filter, options)`

## Tearing down mocks

`fetchMock.mockClear()` can be used to reset the call history

`fetchMock.mockReset()` can be used to remove all configured mocks

Please report any bugs in resetting mocks on the [issues board](https://github.com/wheresrhys/fetch-mock-jest/issues)

# Example

```js
const fetchMock = require('fetch-mock-jest');
const userManager = require('../src/user-manager');

test(async () => {
	const users = [{ name: 'bob' }];
	fetchMock
		.get('http://example.com/users', users)
		.post('http://example.com/user', (url, options) => {
			if (typeof options.body.name === 'string') {
				users.push(options.body);
				return 202;
			}
			return 400;
		})
		.patch(
			{
				url: 'http://example.com/user'
			},
			405
		);

	expect(await userManager.getAll()).toEqual([{ name: 'bob' }]);
	expect(fetchMock).toHaveLastFetched('http://example.com/users
		get');
	await userManager.create({ name: true });
	expect(fetchMock).toHaveLastFetched(
		{
			url: 'http://example.com/user',
			body: { name: true }
		},
		'post'
	);
	expect(await userManager.getAll()).toEqual([{ name: 'bob' }]);
	fetchMock.mockClear();
	await userManager.create({ name: 'sarah' });
	expect(fetchMock).toHaveLastFetched(
		{
			url: 'http://example.com/user',
			body: { name: 'sarah' }
		},
		'post'
	);
	expect(await userManager.getAll()).toEqual([
		{ name: 'bob' },
		{ name: 'sarah' }
	]);
	fetchMock.mockReset();
});
```
