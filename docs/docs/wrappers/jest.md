---
sidebar_label: '@fetch-mock/jest'
sidebar_position: 1
---

# @fetch-mock/jest

A wrapper for [fetch-mock](/fetch-mock/docs/) that improves the developer experience when working with jest. It provides the following:

- Adds methods to fetchMock which wrap its default methods, but align more closely with jest's naming conventions.
- Extends `expect` with convenience methods allowing for expressive tests such as `expect(fetchMock).toHavePosted('http://example.com', {id: 'test-id'})`.
- Can optionally be hooked in to jest's global mock management methods such as `clearAllMocks()`.

## Requirements

@fetch-mock/jest requires either of the following to run:

- [jest](https://jest.dev/guide/)
- The `fetch` API, via one of the following:
  - [Node.js](https://nodejs.org/) 18+ for full feature operation
  - Any modern browser that supports the `fetch` API
  - [node-fetch](https://www.npmjs.com/package/node-fetch) when testing in earlier versions of Node.js (this is untested, but should mostly work)

## Installation

```shell
npm i -D @fetch-mock/jest
```

## Setup

```js
import fetchMock, { manageFetchMockGlobally } from '@fetch-mock/jest';
import { jest } from '@jest/globals';

manageFetchMockGlobally(jest); // optional
```

## API

### fetchMock (default export)

An instance of [fetch-mock](/fetch-mock/docs/), with the following methods added:

#### fetchMock.mockClear()

Clears all call history from the mocked `fetch` implementation.

#### fetchMock.mockReset()

`fetchMock.mockReset({includeSticky: boolean})`

Clears all call history from the mocked `fetch` implementation _and_ removes all routes (including fallback routes defined using `.spy()` or `.catch()`) with the exception of sticky routes. To remove these, pass in the `includeSticky: true` option. FOr more fine grained control over fallback routes and named routes please use `fetchMock.removeRoutes()`

#### fetchMock.mockRestore()

`fetchMock.mockRestore({includeSticky: boolean})`

Calls `mockReset()` and additionally restores global fetch to its unmocked implementation.

### manageFetchMockGlobally(jest)

Hooks fetchMock up to jest's global mock management so that

- `jest.clearAllMocks()` will call `fetchMock.mockClear()`
- `jest.resetAllMocks()` will call `fetchMock.mockReset()`
- `jest.restoreAllMocks()` will call `fetchMock.mockRestore()`

Note that these **will not** clear any sticky routes added to fetchMock. You will need to make an additional call to `fetchMock.removeRoutes({includeSticky: true})`.

### Expect extensions

These are added to jest automatically and are available on any expect call that is passed `fetchMock` (or `fetch`, if it has been mocked globally by fetchMock) as an argument. Their behaviour is similar to the jest expectation methods mentioned in the comments below

```js
expect(fetchMock).toHaveFetched(filter, options); // .toHaveBeenCalled()/.toHaveBeenCalledWith()
expect(fetchMock).toHaveLastFetched(filter, options); // .toHaveBeenLastCalledWith()
expect(fetchMock).toHaveNthFetched(n, filter, options); //  .toHaveBeenNthCalled()/.toHaveBeenNthCalledWith()
expect(fetchMock).toHaveFetchedTimes(n, filter, options); // .toHaveBeenCalledTimes()
expect(fetchMock).toBeDone(filter);
```

### Notes

- `filter` and `options` are the same as those used by `fetchMock.callHistory.calls()`.
- Each method can be prefixed with the `.not` helper for negative assertions. e.g. `expect(fetchMock).not.toBeDone('my-route')`
- In each of the method names `Fetched` can be replaced by any of the following verbs to scope to a particular method:
  - Got
  - Posted
  - Put
  - Deleted
  - FetchedHead
  - Patched
    e.g. `expect(fetchMock).toHaveDeleted('http://example.com/user/1')`
