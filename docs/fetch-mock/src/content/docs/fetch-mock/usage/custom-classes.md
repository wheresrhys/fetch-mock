---
title: Custom subclasses
sidebar:
  # Set a custom label for the link
  label: Custom sidebar label
  # Set a custom order for the link (lower numbers are displayed higher up)
  order: 2
  # Add a badge to the link
  badge:
    text: New
    variant: tip
---
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
