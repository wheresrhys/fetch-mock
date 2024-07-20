---
sidebar_position: 3
sidebar_label: Shorthands, .get(), .once() etc.
---

# Routing shorthands

These methods allow defining routes for common use cases while avoiding writing hard to read configuration objects. Unless noted otherwise, each of the methods below have the same signature as `.route()`

## .catch()

`.catch(response)`

Specifies how to respond to calls to `fetch` that don't match any routes.

It accepts any [response](#api-mockingmock_response) compatible with `.route()`. If no argument is passed, then every unmatched call will receive a `200` response.

## .sticky()

Shorthand for `mock()` which creates a route that persists even when `restore()`, `reset()` or `resetbehavior()` are called;

This method is particularly useful for setting up fixtures that must remain in place for all tests, e.g.

```js
fetchMock.sticky(/config-hub.com/, require('./fixtures/start-up-config.json'));
```

## .once()

Shorthand for `mock()` which creates a route that can only mock a single request. (see `repeat` option above)

## .any()

`.any(response, options)`

Shorthand for `mock()` which creates a route that will return a response to any fetch request.

## .anyOnce(response, options)

`.anyOnce(response, options)`

Creates a route that responds to any single request

## .get(), .post(), .put(), .delete(), .head(), .patch()

Shorthands for `mock()` that create routes that only respond to requests using a particular http method.

If you use some other method a lot you can easily define your own shorthands e.g.

```javascript
fetchMock.purge = function (matcher, response, options) {
	return this.mock(
		matcher,
		response,
		Object.assign({}, options, { method: 'PURGE' }),
	);
};
```

## .getOnce(), .postOnce(), .putOnce(), .deleteOnce(), .headOnce(), .patchOnce()

Creates a route that only responds to a single request using a particular http method

## .getAny(), .postAny(), .putAny(), .deleteAny(), .headAny(), .patchAny()

`.___Any(response, options)`

Creates a route that responds to any requests using a particular http method.

## .getAnyOnce(), .postAnyOnce(), .putAnyOnce(), .deleteAnyOnce(), .headAnyOnce(), .patchAnyOnce()

`.___AnyOnce(response, options)`

Creates a route that responds to any single request using a particular http method.
