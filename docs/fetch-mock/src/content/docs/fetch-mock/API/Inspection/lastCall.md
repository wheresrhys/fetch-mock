---
title: .lastCall(filter, options)
sidebar:
  label: .lastCall()
  order: 4
---
Returns the arguments for the last call to `fetch` matching the given `filter` and `options`. The call is returned as a `[url, options]` array. If `fetch` was called using a `Request` instance, the `url` and `options` will be inferred from it, and the original `Request` will be available as a `request` property on this array.
