# @fetch-mock/codemods

A tool for helping upgrade to fetch-mock@12.

## Features

- Identifies instances of fetch-mock imported using `require` or `import`
- Rewrites `.mock()` to `.route()`
- Rewrites `.reset()`, `.restore()`, `.resetBehavior()` and `.resetHistory()` to their equivalents in fetch-mock@12
- Rewrites `.lastUrl()`, `.lastOptions()` and `lastResponse()` to their equivalents in fetch-mock@12
- Adds an informative error whenever `.lastCall()` or `.calls()` are used with advice on how to manually correct these
- Converts `.getOnce()`, `.getAnyOnce()`, `.postOnce()` etc... - which have been removed - to calls to the underlying `.get()` method with additional options passed in.
- Removes uses of the deprecated options `overwriteRoutes`, `warnOnFallback`, `sendAsJson`
- Removes uses of the deprecated `fallbackToNetwork` option, and adds an informative error with details of how to replace with the `spyGlobal()` method

## Limitations/Out of scope

- Javascript is a language with multiple ways to do the same thing. While these codemods attempt to cover a few different patterns, it's likely that they don't cover all the ways fetch-mock is being used. Please raise an issue if you think they can be improved.
- fetch-mock@12 no longer has the `.mock()` method which combines defining a route _and_ setting up global mocking. All calls to `.mock()` are replaced by `.route()`.
  If using global `fetch` you will also need to call `.mockGlobal()` at least once per test suite.
- The `.sandbox()` method previously created a `fetch` function that also had all the fetch-mock methods attached. This is no longer the case, but pulling it apart is complex and deliberately left out of scope for thsi codemod.
- Any uses of fetch-mock prior to assignig to a variable will not be modified e.g. `require('fetch-mock').mock('a', 'b')` will not be converted to `require('fetch-mock').route('a', 'b')`
- When using a pattern such as `jest.mock('node-fetch', () => require('fetch-mock').sandbox())`, the codemod is unable to identify that `require('node-fetch')` will be an instance of fetch-mock.

Taking the last 3 points together, this example illustrates the kind of manual modifications required:

### Before

```js
jest.mock('node-fetch', () => require('fetch-mock').sandbox());

const nodeFetch = require('node-fetch');

it('runs a test', () => {
	nodeFetch.get('http://a.com', 200);
	myAPI.call();
	expect(nodeFetch.called()).toBe(true);
});
```

### After

```js
const fetchMock = require('fetch-mock');

jest.mock('node-fetch', () => fetchMock.fetchHandler);
const nodeFetch = require('node-fetch');

it('runs a test', () => {
	fetchMock.get('http://a.com', 200);
	myAPI.call();
	expect(fetchMock.called()).toBe(true);
});
```

## Usage

1. Do all your manual mods
2. run
3. correct all errors
   If you use `.sandbox()` or other mocing libraries to assign fetch-mock to
