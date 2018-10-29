---
title: Global or non-global
position: 3
parentMethod: installation
content_markdown: |-
  `fetch` can be used by your code globally or locally. It's important to determine which one applies to your codebase as it will impact how you use `fetch-mock`
  {: .warning}

  #### Global fetch
  In the following scenarios `fetch` will be a global
  - When using native `fetch` (or a polyfill) in the browser
  - When `node-fetch` has been assigned to `global` in your nodejs process (a pattern sometimes used in isomorphic codebases)

  By default fetch-mock assumes `fetch` is a global so once you've required fetch-mock, refer to the quickstart and api docs.

  #### Non-global fetch library
  In the following scenarios `fetch` will not be a global

  - Using [node-fetch](https://www.npmjs.com/package/node-fetch) in nodejs without assigning to `global`
  - Using [fetch-ponyfill](https://www.npmjs.com/package/fetch-ponyfill) in the browser
  - Using libraries which use fetch-ponyfill internally
  - Some build setups result in a non-global `fetch`, though it may not always be obvious that this is the case

  The `sandbox()` method returns a function that can be used as a drop-in replacement for `fetch`, and can be passed into your choice of mocking library. The function returned by `sandbox()` supports the full fetch-mock api so once generated it can be worked with as if it were the original `fetch-mock` object, e.g.

  ```js
  const fetchMock = require('fetch-mock');
  const myMock = fetchMock.sandbox().mock('/home', 200);
  // pass myMock in to your application code, instead of fetch, run it, then...
  expect(myMock.called('/home')).to.be.true;
  ```
---
