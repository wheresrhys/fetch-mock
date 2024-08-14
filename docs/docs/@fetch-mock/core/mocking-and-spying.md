---
sidebar_position: 1
---

# Mocking and spying

These methods allow mocking or spying on the `fetch` implementation used by your application.

## fetchHandler

`fetchMock.fetchHandler(url, requestInit)`

A mock implementation of `fetch`.

By default it will error. In order to return responses `.route()`, `.catch()` and other routing methods of `fetchMock` must first be used to add routes to its internal router.

All calls made using `fetchMock.fetchHandler` are recorded in `fetchMock.callHistory`.

You can either pass `fetchMock.fetchHandler` into your choice of mocking library or use the methods below to mock global `fetch`.

## mockGlobal()

Replaces `globalThis.fetch` with `fm.fetchHandler`

## unmockGlobal()

Restores `globalThis.fetch` to its original state

## spy(matcher, name)

Falls back to the `fetch` implementation set in `fetchMock.config.fetch` for a specific route (which can be named).

When no arguments are provided it will fallback to the native fetch implementation for all requests, similar to `.catch()`.

## spyGlobal()

Equivalent to calling `.mockGlobal()` followed by `.spy()`
