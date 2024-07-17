---
title: Resetting
sidebar:
  order: 2
---

## .restore() / .reset()

Resets `fetch()` to its unstubbed state and clears all data recorded for its calls. `restore()` is an alias for `reset()`. Optionally pass in a `{sticky: true}` option to remove even sticky routes.

Both methods are bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.reset)` will work just fine. There is no need for `afterEach(() => fetchMock.reset())`

## .resetHistory()

Clears all data recorded for `fetch`'s calls. It _will not_ restore fetch to its default implementation

`resetHistory()` is bound to fetchMock, and can be used directly as a callback e.g. `afterEach(fetchMock.resetHistory)` will work just fine. There is no need for `afterEach(() => fetchMock.resetHistory())`

## .resetBehavior()

Removes all mock routes from the instance of `fetch-mock`, and restores `fetch` to its original implementation if mocking globally. Will not clear data recorded for `fetch`'s calls. Optionally pass in a `{sticky: true}` option to remove even sticky routes.
