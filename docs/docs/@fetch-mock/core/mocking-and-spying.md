---
sidebar_position: 3
---

# Mocking and spying

These methods allow mocking or spying on the `fetch` implementation used by your application.

Note that these methods are only implemented in `@fetch-mock/core` and are not avilable when using `@fetch-mock/jest`, `@fetch-mock/vitest` etc.... Those libraries provide ways to mock `fetch` that are more idiomatic to their own ecosystem.

## When using global fetch in your application

### mockGlobal()

Replaces `globalThis.fetch` with `fm.fetchHandler`

### unmockGlobal()

Restores `globalThis.fetch` to its original state

### spy(matcher, name)

Falls back to the `fetch` implementation set in `fetchMock.config.fetch` for a specific route (which can be named).

When no arguments are provided it will fallback to the native fetch implementation for all requests, similar to `.catch()`

### spyGlobal()

Equivalent to calling `.mockGlobal()` followed by `.spy()`
