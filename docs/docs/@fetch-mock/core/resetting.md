---
sidebar_position: 5
---

# Resetting

The methods below can be used to restore some or all of fetchMock's behaviour toits default state.

## .removeRoutes(options)

This method removes some or all of the routes that have been added to fetch mock. It accepts the following options.

### names

An array of named routes to remove. If no value is passed then all routes compatible with the other options passed are removed.

### includeSticky

A boolean indicating whether or not to remove sticky routes.

### includeFallback

A boolean indicating whether or not to remove the fallback route (added using `.catch()`)

## .clearHistory()

Clears all data recorded for `fetch`'s calls.

## unmockGlobal()

Restores global `fetch` to its original state if `.mockGlobal()` or `.spyGlobal()` have been used .

## .createInstance()

Can be used to create a standalone instance of fetch mock that is completely independent of other instances.

In older environments - where `fetch` was not a global and test files often ran in a shared process - this was very useful for increasing parallelisation. But in more modern setups - global `fetch` and isolated processes per test file - it's less relevant.

It can however be used as an alternative to `fetchMock.removeRoutes().clearHistory()` by creating a completely new fetchMock instance and swapping this for the previously used one.

It can also be used to "fork" a previous instance as routes are cloned from one instance to another. However call history is always reset for new instances.

```js
fetchMock.route('http://my.site', 200);
fetchMock.fetchHandler('http://my.site');

const newFM = fetchMock.createInstance();

newFM.routes.routes; // Array[1]
newFM.callHistory.calls(); // Array[0]
```
