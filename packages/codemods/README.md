# @fetch-mock/codemods

A tool for helping upgrade to fetch-mock@12.

## Usage

1. Install `npm i -D @fetch-mock/codemods jscodeshift fetch-mock@12`;
2. Manually modify any code using `.sandbox()` according to the example at the bottom of this page.
3. Run `jscodeshift -t node_modules/@fetch-mock/codemods/src/index.js  --ignore-pattern="node_modules/**/*" .` to run over your entire project, or replace `.` with the directory/file paths you wish to modify. [The jscodeshift CLI has many options](https://jscodeshift.com/run/cli/) - adjust them to suit your project. **Note that the parser option should not be used as @fetch-mock/codemods forces use of the TSX parser in order to ensure compatibility with teh greatest range of projects**.
4. For scenarios where the codemod is unable to detect which variable contains a fetch-mock instance (e.g. when it is required in a global set up file, or when using `jest.mock()` or fetch-mock-jest) you may pass in one or more variable names using the `FM_VARIABLES` environment variable e.g. `FM_VARIABLES=fm,fetch`
5. After the codemods have executed:
   a) If mocking global `fetch` you will probably need to add a call to `.mockGlobal()` at least once per test suite, possibly in a `beforeAll`/`beforeEach` block.
   b) Correct all the errors inserted by the codemod related to use of `fallbackToNetwork`, `.calls()` or `.lastCall()` usage.
   c) Run all your tests and fix any issues. If you believe the codemods have made any errors, or have missed any easy to modify patterns, please [raise an issue](https://github.com/wheresrhys/fetch-mock/issues).
6. Once all your tests are fixed you should be able to uninstall the codemods: `npm uninstall @fetch-mock/codemods jscodeshift`

### Usage with fetch-mock-jest

If you're using fetch-mock-jest, you should migrate to @fetch-mock/jest, which is built around fetch-mock@12. While these codemods have not been tested on fetch-mock-jest, in principle you should be able use them by making similar adjustments to those described below about use with the `sandbox()` method, and by using the `FM_VARIABLES` environment variable to help the codemod identify which variables contain instances of fetch-mock.

## Modifications that will be made

For everyt variable containing an instance of fetch-mock imported using `require` or `import` it will:

- Rewrite `.mock()` to `.route()`
- Rewrite `.reset()`, `.restore()`, `.resetBehavior()` and `.resetHistory()` to their equivalents in fetch-mock@12
- Rewrite `.lastUrl()`, `.lastOptions()` and `lastResponse()` to their equivalents in fetch-mock@12
- Adds an informative error whenever `.lastCall()` or `.calls()` are used with advice on how to manually correct these
- Converts `.getOnce()`, `.getAnyOnce()`, `.postOnce()` etc... - which have been removed - to calls to the underlying `.get()` method with additional options passed in.
- Removes uses of the deprecated options `warnOnFallback` and `sendAsJson`
- Removes uses of the deprecated `overwriteRoutes` option, and adds an informative error with details of how to replace with the `modifyRoute()` method
- Removes uses of the deprecated `fallbackToNetwork` option, and adds an informative error with details of how to replace with the `spyGlobal()` method

## Limitations/Out of scope

- Javascript is a language with multiple ways to do the same thing. While these codemods attempt to cover a few different patterns, it's likely that they don't cover all the ways fetch-mock is being used. Please raise an issue if you think they can be improved.
- fetch-mock@12 no longer has the `.mock()` method which combines defining a route _and_ setting up global mocking. All calls to `.mock()` are replaced by `.route()`.
  If using global `fetch` you will also need to call `.mockGlobal()` at least once per test suite.
- The `.sandbox()` method previously created a `fetch` function that also had all the fetch-mock methods attached. This is no longer the case, but pulling it apart is complex and deliberately left out of scope for this codemod.
- Any uses of fetch-mock prior to assigning to a variable will not be modified e.g. `require('fetch-mock').mock('a', 'b')` will not be converted to `require('fetch-mock').route('a', 'b')`
- When using a pattern such as `jest.mock('node-fetch', () => require('fetch-mock').sandbox())`, the codemod is unable to identify that `require('node-fetch')` will be an instance of fetch-mock.
- On the server side fetch-mock was previously built around node-fetch's classes, but now uses native `fetch`. In most cases, even if your application code still uses node-fetch, your mocks will still work. However, if you explicitly create instances of `Request` or `Headers` using node-fetch's classes, you may need to provide these to fetch-mock.

## Manual adjustments when working with sandbox()

Taking the last 4 points together, this example illustrates the kind of manual modifications required:

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

jest.mock('node-fetch', () => {
	const nodeFetch = jest.requireActual('node-fetch');
	// only needed if your application makes use of Response, Request
	// or Headers classes directly
	Object.assign(fetchMock.config, {
		fetch: nodeFetch,
		Response: nodeFetch.Response,
		Request: nodeFetch.Request,
		Headers: nodeFetch.Headers,
	});
	return fetchMock.fetchHandler;
});
const nodeFetch = require('node-fetch');

it('runs a test', () => {
	fetchMock.get('http://a.com', 200);
	myAPI.call();
	expect(fetchMock.called()).toBe(true);
});
```
