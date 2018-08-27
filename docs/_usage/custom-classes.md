---
title: Configuring fetch subclasses
position: 6
parameters:
  - name:
    content:
content_markdown: |-
  Some fetch-mock internals require access to the `Request`, `Response` and `Headers` constructors provided by your chosen `fetch` implementation. These should be set on the `fetchMock.config` object
  {: .warning}

  ```javascript
  const ponyfill = require('fetch-ponyfill')();
  fetchMock.config = Object.assign(fetchMock.config, {
      Headers: ponyfill.Headers,
      Request: ponyfill.Request,
      Response: ponyfill.Response,
      fetch: ponyfill
  })
```
---
