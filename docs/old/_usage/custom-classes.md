---
title: Custom subclasses
position: 6
parentItem: installation
versionAdded: 5.9.0
content_markdown: |-
  `fetch-mock` uses `Request`, `Response` and `Headers` constructors internally, and obtains these from `node-fetch` in Node.js, or `window` in the browser. If you are using an alternative implementation of `fetch` you will need to configure `fetch-mock` to use its implementations of these constructors instead. These should be set on the `fetchMock.config` object, e.g.

  ```javascript
  const ponyfill = require('fetch-ponyfill')();
  Object.assign(fetchMock.config, {
      Headers: ponyfill.Headers,
      Request: ponyfill.Request,
      Response: ponyfill.Response,
      fetch: ponyfill
  })
  ```
---
