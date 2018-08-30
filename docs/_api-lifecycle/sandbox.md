---
title: ".sandbox()"
position: 1.0
description: |-
  Returns a drop-in mock for fetch which can be passed to other mocking libraries. It implements the full fetch-mock api and maintains its own state independent of other instances, so tests can be run in parallel.
left_code_blocks:
  - code_block: |-
      fetchMock
        .sandbox()
        .mock('http://domain.com', 200)
    title: Example
    language: javascript

---


#### `sandbox()`

This returns a drop-in mock for fetch which can be passed to other mocking libraries. It implements the full fetch-mock api and maintains its own state independent of other instances, so tests can be run in parallel. e.g.

#### `restore()/reset()`

Chainable method that restores `fetch()` to its unstubbed state and clears all data recorded for its calls.

#### `resetHistory()`

Chainable method that clears all data recorded for `fetch()`'s calls. _It will not restore fetch to its default implementation_

_Note that `restore()`, `reset()` and `resetHistory()` are all bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.reset)` will work just fine. There is no need for `afterEach(function () {fetchMock.reset()})`_

#### `flush()`

Returns a `Promise` that resolves once all fetches handled by fetch-mock have resolved. Pass in `true` to wait for all response methods (`res.json()`, `res.text()`, etc.) to resolve too. Useful for testing code that uses `fetch` but doesn't return a promise.
