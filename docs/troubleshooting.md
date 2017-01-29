- [Introduction](/fetch-mock)
- [Quickstart](/fetch-mock/quickstart)
- [Installation and usage ](/fetch-mock/installation)
- [API documentation](/fetch-mock/api)
- Troubleshooting
- [Examples](/fetch-mock/examples)

# Troubleshooting

### `fetch` is assigned to a local variable, not a global

First of all, consider whether you could just use `fetch` as a global. Here are 3 reasons why this is a good idea:
- The `fetch` standard defines it as a global (and in some cases it won't work unless bound to `window`), so to write isomorphic code it's probably best to stick to this pattern
- [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch) takes care of installing it as a global in nodejs or the browser, so there's no effort on your part to do so.
- `fetch-mock` is primarily designed to work with `fetch` as a global and your experience of using it will be far more straightforward if you follow this pattern

Still not convinced?

In that case `fetchMock.sandbox()` can be used to generate a function which you can pass in to a mock loading library such as [`mockery`](https://www.npmjs.com/package/mockery) instead of `fetch`

### `fetch` doesn't seem to be getting mocked?
* If using a mock loading library such as `mockery`, are you requiring the module you're testing after registering `fetch-mock` with the mock loader? You probably should be ([Example incorrect usage](https://github.com/wheresrhys/fetch-mock/issues/70)). If you're using ES6 `import` it may not be possible to do this without reverting to using `require()` sometimes.
* If using `isomorphic-fetch` in your source, are you assigning it to a `fetch` variable? You *shouldn't* be i.e. 
  * `import 'isomorphic-fetch'`, not `import fetch from 'isomorphic-fetch'`
  * `require('isomorphic-fetch')`, not `const fetch = require('isomorphic-fetch')`

### Environment doesn't support requiring fetch-mock?
* If your client-side code or tests do not use a loader that respects the browser field of package.json use `require('fetch-mock/es5/client')`.
* If you need to use fetch-mock without commonjs, you can include the precompiled `node_modules/fetch-mock/es5/client-browserified.js` in a script tag. This loads fetch-mock into the `fetchMock` global variable.
* For server side tests running in nodejs 0.12 or lower use `require('fetch-mock/es5/server')`

### Matching `Request` objects in node fails
In node, if using npm at a version less than 2 the `Request` constructor used by `fetch-mock` won't necessarily be the same as the one used by `node-fetch`. To fix this either:
* upgrade to npm@3
* use `fetchMock.setImplementations({Request: myRequest})`, where `myRequest` is a reference to the Request constructor used in your application code.


