---
title: Global or non-global
position: 3
parentItem: installation
content_markdown: |-
  `fetch` can be used by your code globally or locally. It's important to determine which one applies to your codebase as it will impact how you use `fetch-mock`
  {: .warning}

  #### Global fetch
  In the following scenarios `fetch` will be a global
  - When using native `fetch` (or a polyfill) in the browser
  - When `node-fetch` has been assigned to `global` in your Node.js process (a pattern sometimes used in isomorphic codebases)

  By default fetch-mock assumes `fetch` is a global so no more setup is required once you've required `fetch-mock`.

  #### Non-global fetch library
  In the following scenarios `fetch` will not be a global

  - Using [node-fetch](https://www.npmjs.com/package/node-fetch) in Node.js without assigning to `global`
  - Using [fetch-ponyfill](https://www.npmjs.com/package/fetch-ponyfill) in the browser
  - Using libraries which use fetch-ponyfill internally
  - Some build setups result in a non-global `fetch`, though it may not always be obvious that this is the case

  The `sandbox()` method returns a function that can be used as a drop-in replacement for `fetch`. Pass this into your mocking library of choice. The function returned by `sandbox()` has all the methods of `fetch-mock` exposed on it, e.g.

  ```js
  const fetchMock = require('fetch-mock');
  const myMock = fetchMock.sandbox().mock('/home', 200);
  // pass myMock in to your application code, instead of fetch, run it, then...
  expect(myMock.called('/home')).to.be.true;
  ```
---
