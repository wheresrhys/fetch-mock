---
sidebar_position: 3
---

# Mocking and spying

These methods allow mocking or spying on the `fetch` implementation used by your application.

Note that these methods are only implemented in `@fetch-mock/core` and are not avilable when using `@fetch-mock/jest`, `@fetch-mock/vitest` etc.... Those libraries provide ways to mock `fetch` that are more idiomatic to their own ecosystem.

Wrapper around @fetch-mock/core that implements mocking of global fetch, including spying on and falling through to the native fetch implementation.

In addition to the @fetch-mock/core API its methods are:

## When using global fetch in your application

### mockGlobal()

Replaces `fetch` with `fm.fetchHandler`

### spyGlobal()

Replaces `fetch` with `fm.fetchHandler`, but falls back to the network for any unmatched calls

### spyRoute(matcher, name)

Falls back to `fetch` for a specific route (which can be named). 

This can also be used when using non-global `fetch` (see `setFetchImplementation()` below).

### restoreGlobal()

Restores `fetch` to its original state


## When using non-global fetch

e.g. `const fetch = require('node-fetch')`

Note that none of these methods actually replace your local implementation of `fetch` with `fetchMock.fetchHandler` - that is left to you to implement with the mocking library/approach of your choice.

## spyLocal(fetchImplementation)

Fall back to the provided `fetch` implementation for any calls unmatched by a route. 

## setfetchImplementation(fetchImplementation)

When you wish to use `.spyRoute()` use this function first to provide a `fetch` implementation to use.
