- [Introduction](/fetch-mock)
- [Quickstart](/fetch-mock/quickstart)
- Installation and usage 
- [API documentation](/fetch-mock/api)
- [Troubleshooting](/fetch-mock/troubleshooting)
- [Examples](/fetch-mock/examples)

# Installation
Install fetch-mock using `npm install --save-dev fetch-mock`

In most environments use `const fetchMock = require('fetch-mock')` to use it in your code. Some exceptions include:

* If your client-side code or tests do not use a loader that respects the browser field of `package.json` use `require('fetch-mock/es5/client')`.
* If you need to use fetch-mock without commonjs, you can include the precompiled `node_modules/fetch-mock/es5/client-browserified.js` in a script tag. This loads fetch-mock into the `fetchMock` global variable.
* For server side tests running in nodejs 0.12 or lower use `require('fetch-mock/es5/server')`

## Global fetch
By default fetch-mock assumes `fetch` is a global so once you've required fetch-mock refer to the quickstart and api docs.

### Polyfilling fetch
Many older browsers will require polyfilling the `fetch` global

* In nodejs `require('isomorphic-fetch')` before any of your tests.
* In the browser `require('isomorphic-fetch')` can also be used, but it may be easier to `npm install whatwg-fetch` (the module isomorphic-fetch is built around) and load `./node_modules/whatwg-fetch/fetch.js` directly into the page, either in a script tag or by referencing in your test runner config.
* When using karma-webpack it's best not to use the `webpack.ProvidePlugin` for this. Instead just add `node_modules/whatwg-fetch/fetch.js` to your list of files to include, or require it directly into your tests before requiring fetch-mock.

## Non-global fetch

When using a non-global fetch implementation (such as node-fetch or fetch-ponyfill) use the `sandbox()` method to return a function that can be used as a replacement for fetch, and be passed into your source code using your choice of mocking library. The function returned by `sandbox()` supports the full fetch-mock api so once generated it can be worked with as if it were the original `fetch-mock` object, e.g.

```
const fetchMock = require('fetch-mock');
const myMock = fetchMock.sandbox().mock('/home', 200);
// pass myMock in to your application code, instead of fetch, run it, then...
expect(myMock.called('/home')).to.be.true;
```

## References to Request, Response, Helpers and Promise
If you're using a non-global fetch implementation, or wish to use a custom Promise implementation, you may need to tell fetch-mock to use these when matching requests and returning responses. Do this using the `.setImplementations()` method. e.g. 

```
fetchMock.setImplementations({Promise: require('Bluebird').promise})
```

In particular, when using fetch-ponyfill 

```
setImplementations(require('fetch-ponyfill')())`
```

will set all the internal references to point at fetch-ponyfill's classes.
