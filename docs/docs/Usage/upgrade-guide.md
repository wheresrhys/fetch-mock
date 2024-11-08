---
title: Upgrade guide
---

fetch-mock@12 has many breaking changes compared to fetch-mock@11:

The [@fetch-mock/codemods](https://www.npmjs.com/package/@fetch-mock/codemods) library provides a tool that will attempt to fix most of these automatically, and its readme contains advice on which manual changes to make alongside these.

## Summary of changes

### Uses global, native `fetch` implementation in all environments

Previously this was true in browsers, but in node.js the node-fetch library was used.

### `.mock()` method removed

This combined adding a route with mocking the global instance of `fetch`. These are now split into 2 methods: `.route()` and `.mockGlobal()`.

### Reset methods changed

`.reset()`, `.restore()`, `.resetBehavior()` and `.resetHistory()` have been removed and replaced with [methods that are more granular and clearly named](/fetch-mock/docs/API/resetting). Note that the [jest](/fetch-mock/docs/wrappers/jest) and [vitest](/fetch-mock/docs/wrappers/vitest) wrappers for fetch-mock still implement `.mockClear()`, `mockReset()` and `mockRestore()`.

### Call history methods changed

The filtering behaviour has been rewritten around named routes, and methods return CallLog objects that contain far more metadata about the call. [Call history docs](/fetch-mock/docs/API/CallHistory)

### Relative URLs not permitted by default in Node.js

A consequence of shifting to use the native implementation of the URL class is that relative URLs are no longer permissable when running tests in node.js, but [this can easily be enabled](https://www.wheresrhys.co.uk/fetch-mock/docs/Usage/configuration#allowrelativeurls).

### Some convenience routing methods removed

`getOnce()` and `getAnyOnce()` have been removed, but the behaviour can still be implemented by the user as follows:

- `getOnce()` -> `get(url, response, {repeat: 1})`
- `getAnyOnce()` -> `get('*', response, {repeat: 1})`

The same is true for `postOnce()`, `deleteOnce()` etc.

### Options removed

- `overwriteRoutes` - this reflects that multiple routes using the same underlying matcher but different options no longer throw an error.
- `warnOnFallback` - given the improved state of node.js debugging tools compared to when fetch-mock was first written, this debugging utilty has been removed.
- `sendAsJson` - fetch-mock@12 implements streams more robustly than previous options, so the user no longer needs to flag when an object response should be converted to JSON.
- `fallbackToNetwork` - The [`spyGlobal()` method](/fetch-mock/docs/API/mocking-and-spying#spyglobal) should now be used.

### `sandbox()` method removed

This was principally used when mocking node-fetch referenced as a local variable. Given that `fetch` is now available as a native global it's less useful and has been removed. If necessary to mock a local instance of node-fetch use [`.fetchHandler`](/fetch-mock/docs/API/mocking-and-spying#fetchhandler)
