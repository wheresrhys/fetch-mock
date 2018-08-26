- [Introduction](/fetch-mock)
- [Quickstart](/fetch-mock/quickstart)
- Installation and usage
- [API documentation](/fetch-mock/api)
- [Troubleshooting](/fetch-mock/troubleshooting)
- [Examples](/fetch-mock/examples)

# Installation

## Requirements

fetch-mock requires the following to run:

- [Node.js](https://nodejs.org/) 8+ for full feature operation
- [Node.js](https://nodejs.org/) 0.12+ with [limitations](http://www.wheresrhys.co.uk/fetch-mock/installation)
- [npm](https://www.npmjs.com/package/npm) (normally comes with Node.js)
- Either of the following
  - [node-fetch](https://www.npmjs.com/package/node-fetch) when testing in a nodejs
  - A browser that supports the `fetch` API when testing in a browser

## Installation and importing
Install fetch-mock using `npm install --save-dev fetch-mock`

In most environments use one of the following to use it in your code.

```js
const fetchMock = require('fetch-mock');

// The following is recommended in order to expose constants that
// will make tests that check for matched or unmatched calls more
// readable
const { fetchMock, MATCHED, UNMATCHED } = require('fetch-mock');
```

Some exceptions include:

- If your client-side code or tests do not use a loader that respects the `browser` field of `package.json` use `require('fetch-mock/es5/client')`.
- If you need to use fetch-mock without commonjs, you can include the precompiled `node_modules/fetch-mock/es5/client-bundle.js` in a script tag. This loads fetch-mock into the `fetchMock` global variable.
- For server side tests running in nodejs 6 or lower use `require('fetch-mock/es5/server')`

## Global or library?
`fetch` can be used by your code in two different ways. It's important to determine which one applies to your codebase as it will impact how you use `fetch-mock`

In the following scenarios `fetch` will be a global
- When using native `fetch` (or a polyfill) in the browser
- When `node-fetch` has been assigned to `global` in your nodejs process (a pattern sometiems used in isomorphic codebases)

Alternatively, `fetch` may be used by your js modules as an imported/required library. Scenarios where this holds true are varied, but include
- Using `node-fetch` in nodejs without assigning to `global`
- Using [fetch-ponyfill](https://www.npmjs.com/package/fetch-ponyfill) in the browser
- Using browser libraries which use [fetch-ponyfill](https://www.npmjs.com/package/fetch-ponyfill)
- Some build setups (e.g React native) sometimes follow this pattern, though it may not always be obvious that they do


## Usage with global fetch
By default fetch-mock assumes `fetch` is a global so once you've required fetch-mock, refer to the quickstart and api docs.

### Polyfilling fetch

Many older browsers will require polyfilling the `fetch` global

- In nodejs `require('isomorphic-fetch')` before any of your tests.
- In the browser `require('isomorphic-fetch')` can also be used, but it may be easier to `npm install whatwg-fetch` (the module isomorphic-fetch is built around) and load `./node_modules/whatwg-fetch/fetch.js` directly into the page, either in a script tag or by referencing in your test runner config.
- When using karma-webpack it's best not to use the `webpack.ProvidePlugin` for this. Instead just add `node_modules/whatwg-fetch/fetch.js` to your list of files to include, or require it directly into your tests before requiring fetch-mock.

## Usage with a required fetch library

The `sandbox()` method returns a function that can be used as a drop-in replacement for `fetch`, and can be passed into your choice of mocking library. The function returned by `sandbox()` supports the full fetch-mock api so once generated it can be worked with as if it were the original `fetch-mock` object, e.g.

```
const fetchMock = require('fetch-mock');
const myMock = fetchMock.sandbox().mock('/home', 200);
// pass myMock in to your application code, instead of fetch, run it, then...
expect(myMock.called('/home')).to.be.true;
```

## References to Request, Response, Headers, fetch and Promise

If you're using a non-global fetch implementation, or wish to use a custom Promise implementation, you may need to tell fetch-mock to use these when matching requests and returning responses. Do this by setting these properties on `fetchMock.config`, e.g

```
const ponyfill = require('fetch-ponyfill')();
fetchMock.config = Object.assign(fetchMock.config, {
    Promise: require('Bluebird').promise,
    Headers: ponyfill.Headers,
    Request: ponyfill.Request,
    Response: ponyfill.Response,
    fetch: ponyfill
},
```

This should be done before running any tests.

_When using `node-fetch`, `fetch-mock` will use the instance you already have installed so there should be no need to set any of the above (apart from `fetch`, which is required if you intend to use the `.spy()` method)_
