---
title: Non-global fetch
position: 4
parameters:
  - name:
    content:
content_markdown: |-
  `fetch` may be used by your js modules as an imported/required library. Scenarios where this holds true are varied, but include
  - Using `node-fetch` in nodejs without assigning to `global`
  - Using [fetch-ponyfill](https://www.npmjs.com/package/fetch-ponyfill) in the browser
  - Using browser libraries which use [fetch-ponyfill](https://www.npmjs.com/package/fetch-ponyfill)
  - Some build setups (e.g React native) sometimes follow this pattern, though it may not always be obvious that they do

  The `sandbox()` method returns a function that can be used as a drop-in replacement for `fetch`, and can be passed into your choice of mocking library. The function returned by `sandbox()` supports the full fetch-mock api so once generated it can be worked with as if it were the original `fetch-mock` object, e.g.

  ```
  const fetchMock = require('fetch-mock');
  const myMock = fetchMock.sandbox().mock('/home', 200);
  // pass myMock in to your application code, instead of fetch, run it, then...
  expect(myMock.called('/home')).to.be.true;
  ```

left_code_blocks:
  - code_block:
    title:
    language:
right_code_blocks:
  - code_block:
    title:
    language:
---
