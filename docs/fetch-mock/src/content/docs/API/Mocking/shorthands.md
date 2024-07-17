---
title: Shorthand methods
sidebar:
  # Set a custom label for the link
  order: 2
---

These methods allow configuring routes for common use cases while avoiding writing configuration objects. Unless noted otherwise, each of the methods below have the same signature as `.mock(matcher, response, optionsOrName)`

## .once()

Shorthand for `mock()` which creates a route that can only mock a single request. (see `repeat` option above)

## .any(response, options)

Shorthand for `mock()` which creates a route that will return a response to any fetch request.

## .anyOnce(response, options)

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

Creates a route that responds to any requests using a particular http method.
As with `.any()`, these only accept the parameters `(response, options)`.

## .getAnyOnce(), .postAnyOnce(), .putAnyOnce(), .deleteAnyOnce(), .headAnyOnce(), .patchAnyOnce()

Creates a route that responds to any single request using a particular http method.
As with `.any()`, these only accept the parameters `(response, options)`.

## .sticky()

Shorthand for `mock()` which creates a route that persists even when `restore()`, `reset()` or `resetbehavior()` are called;

This method is particularly useful for setting up fixtures that must remain in place for all tests, e.g.

```js
fetchMock.sticky(/config-hub.com/, require('./fixtures/start-up-config.json'));
```
