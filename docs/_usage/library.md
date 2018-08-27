---
title: Non-global fetch
position: 4
parameters:
  - name:
    content:
content_markdown: |-
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

