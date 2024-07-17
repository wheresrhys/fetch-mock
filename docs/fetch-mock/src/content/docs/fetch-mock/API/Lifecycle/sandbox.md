---
title: '.sandbox()'
sidebar:
  order: 1
---

Returns a function that can be used as a drop-in replacement for `fetch`. Pass this into your mocking library of choice. The function returned by `sandbox()` has all the methods of `fetch-mock` exposed on it and maintains its own state independent of other instances, so tests can be run in parallel.

```js
fetchMock.sandbox().mock('http://domain.com', 200);
```
