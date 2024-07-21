---
title: Introducing @fetch-mock/core
description: A new library to replace fetch-mock
slug: introducing-core
authors:
  - name: Rhys Evans
    title: fetch-mock maintainer
    url: https://www.wheresrhys.co.uk
hide_table_of_contents: false
---

@fetch-mock/core is a new library for building up a mock fetch implementation, using (more or less) the same chainable API that you're familiar with from fetch-mock. It reimplements a lot of the fetch-mock API, but with some significant changes

## What's gone from fetch-mock

Some features are removed from the @fetch-mock suite for good, while some have been removed from @fetch-mock/core, but will reappear in some form in wrappers of @fetch-mock/core that target specific toolchains.

### Gone for good

#### Inferred route names

This was probably the worst design decision in fetch-mock. Inspecting calls that had been handled by a particular route relied on being able to pick out that route from the list of all routes. Early on fetch-mock mostly supported string matchers, and coercing a string into a string that could be used as a route name is trivial. However, later addition of Regex, Function, header matchers etc meant that this broke down, leading to a confusing experience when trying to retrieve the right fetch calls. In an earlier version I added the ability to explicitly name a route, and in fetch-mock@10 I also added a simpler API for specifying these names. With all that done, it's a lot easier to name, and later refer to, a given route without having to infer any names.

#### `overwriteRoutes`

Due to the inferred naming behaviour described above, fetch-mock was by default very fussy about allowing two different routes which had the same inferred name to be added. Now that inferred routes are gone, there is no longer any need for the user to specify whether or not to overwrite a previously added route; new routes are _always_ added successfully without any reference to the prevoiuosly added routes.

#### Debug logging/`warnOnFallback`

`warnOnFallback` turned on logging if a call was handled by the route added by `.catch()`, or fell back to the network. And the application code was also peppered with lots of uses of the debug library. Taken together these added a lot of bulk to the code, making it harder to read and work with, and I've seen no evidence that users actually find it useful. It's possible I may add some debug logging back in future based on user feedback, but at this point I have no intention to.

#### `.lastUrl()`, `.lastOptions()`, `.lastResponse()`

These methods gave access to specific parts of teh last fetch call. With the introduction of the new `CallLog` format for logging calls these seem unnecessary e.g. `.lastUrl()` can be replaced by `.lastCall().url`.

#### `.sandbox()`

This was another very bad design decision that I'm very happy to get rid of. fetch-mock had no problem mocking global fetch, but in order to mock `node-fetch` I needed to provide a way to expose fetch-mock's mock of `fetch`, `fetchHandler`. I chose the way-too-clever approach of extending `fetchHandler` with the fetchMock object, so that my implementation of fetch also had methods `.mock()`, `.catch()` etc attached to it. This was the number one cause of conflict with Jest.

@fetch-mock/core takes the far more sensible approach of keeping the function and the fetchMock object separate, so that instead of

```js
jest.mock(global, 'fetch', fetchMock.sandbox());
fetch.mock('http://my.site', 200);
```

you now have

```js
jest.mock(global, 'fetch', fetchMock.fetchHandler);
fetchMock.mock('http://my.site', 200);
```

which keeps fetch-mock's methods much further away from any other library's workings.

### Gone, but back soon

The following features will return in other libraries that wrap @fetch-mock/core for different environments.

#### .mock()

@fetch-mock/core does not implement any functionality for replacing global `fetch` or a local `fetch` implementation (such as `node-fetch`) with a mock implementation.

#### .spy()/fallbackToNetwork

As @fetch-mock/core does not do anything to replace the native `fetch` implementation, these features - which pass through the fetch-mock implementation and go straight to the native implementation - are also concersn that will be added to wrappers.

#### restore()/reset()

Libraries such as Jest or Vitest have their own APIs for resetting mocks, so @fetch-mock/core deliberately only contains low level APIs for managing routes and call history. These will be wrapped in ways that are idiomatic for different test frameworks.

## What's new or different

All these additions are intended to simplify the API.

#### `.mock()` renamed to `.route()`

`.mock()` previously did two jobs: mocking the `fetch` global and adding a route. This is replaced by `.route()`, which just adds a route.

#### Filtering calls

Related to the removal of inferred route names, matchers that are passed in to call history as filters are always executed _as matchers_, rather than first being coerced to a string to see if any route with that name exists. On the one hand, this is far more consistent and less confusing, but on the other it does mean that, in situations when you have many similar routes, and if you reliably want to retrieve the calls handled by a specific route, then you should really be giving your routes explicit names, e.g. `fetchMock.route('http://my.site', 200, 'first-route')`

#### `CallLog`

Previously items in the call history were returned as `[url, options]` arrays, with a few additional properties added. Now they are returned as objects - `CallLog`s - that contain all information about the call and how it was handled. The `CallLog` interface is also the expected input for matcher functions and response builder functions.

#### `done()` uses route names

Previously `done()` could be passed a matcher, or a boolean, or... the API was a mess to be honest; I'm not sure I even understood it's behaviour fully. Now it can be passed one or more route names, or nothing at all to check all routes. Much simpler

#### `.removeRoutes()` and `.clearHistory()`

These are the new methods for resetting fetch mock to its default state. The naming is a bit less ambiguous than the previous `reset()`/`restore()` (each testing library seems to have its own interpretation about what those verbs should mean).

#### `.createInstance()`

A replacement for `sandbox()` that eschews all the weird wiring that `.sandbox()` used. Possibly not very useful for the average user, but I use it a lot in my tests for fetch mock, so it stays :-).


## What's still to come

There are a bunch of [breaking changes](https://github.com/wheresrhys/fetch-mock/issues?q=is%3Aopen+is%3Aissue+label%3A%22breaking+change%22) I'd like to ship before getting to v1.0.0. I also want to give users an incentive to migrate so there are a variety of new features I'd like to add and bugs to fix. Have a look at [the issues list](https://github.com/wheresrhys/fetch-mock/issues) and vote for any you like.
