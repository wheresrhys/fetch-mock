---
sidebar_position: 3
---

# Mocking and spying

These methods allow mocking or spying on the `fetch` implementation used by your application.

Note that these methods are only implemented in `@fetch-mock/core` and are not avilable when using `@fetch-mock/jest`, `@fetch-mock/vitest` etc.... Those libraries provide ways to mock `fetch` that are more idiomatic to their own ecosystem.

Wrapper around @fetch-mock/core that implements mocking of global fetch, including spying on and falling through to the native fetch implementation.

In addition to the @fetch-mock/core API its methods are:

## mockGlobal()

Replaces `fetch` with `fm.fetchHandler`

## restoreGlobal()

Restores `fetch` to its original state

## spyGlobal()

Replaces `fetch` with `fm.fetchHandler`, but falls back to the network for any unmatched calls

## spyLocal(fetchImplementation)

When using a non-global implementation of `fetch` (e.g. `const fetch = require('node-fetch')`), this adds that implementation as the network fallback used by `fetchHandler`. Note that this _does not_ actually replace the implementation with `fetchHandler` - that is left to you to implement with the mocking library/approach of your choice.
