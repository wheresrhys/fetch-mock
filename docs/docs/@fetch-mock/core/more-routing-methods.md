---
sidebar_position: 3
sidebar_label: More routing methods
---

# More routing methods

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



## .addMatcher(options)


Allows adding your own, reusable custom matchers to fetch-mock, for example a matcher for interacting with GraphQL queries, or an `isAuthorized` matcher that encapsulates the exact authorization conditions for the API you are mocking, and only requires a `true` or `false` to be input

### Options

#### name

`{String}`

The name of your matcher. This will be the name of the property used to hold any input to your matcher. e.g. `graphqlVariables`

#### usesBody

`{Boolean}`

If your matcher requires access to the body of the request set this to true; because body can, in some cases, only be accessed by fetch-mock asynchronously, you will need to provide this hint in order to make sure the correct code paths are followed.

#### matcher

`{Function}`

A function which takes a route definition object as input, and returns a function of the signature `(url, options, request) => Boolean`. See the examples below for more detail. The function is passed the fetchMock instance as a second parameter in case you need to access any config.

##### Examples

###### Authorization

```js
fetchMock
	.addMatcher({
		name: 'isAuthorized',
		matcher:
			({ isAuthorized }) =>
			(url, options) => {
				const actuallyIsAuthorized = options.headers && options.headers.auth;
				return isAuthorized ? actuallyIsAuthorized : !actuallyIsAuthorized;
			},
	})
	.mock({ isAuthorized: true }, 200)
	.mock({ isAuthorized: false }, 401);
```

###### GraphQL

```js
fetchMock
  .addMatcher({
    name: 'graphqlVariables',
    matcher: ({graphqlVariables}) => (url, options) => {
        if (!/\/graphql$/.test(url)) {
            return false;
        }
        const body = JSON.parse(options.body)
        return body.variables && Object.keys(body.variables).length === Object.keys(body.graphqlVariables).length && Object.entries(graphqlVariables).every(([key, val]) => body.variables[key] === val)
    }
  })
  .mock({graphqlVariables: {owner: 'wheresrhys'}}, {data: {account: {
    name: 'wheresrhys',
    repos: [ ... ]
    }}})
```

One intent behind this functionality is to allow companies or publishers of particular toolsets to provide packages that extend fetch-mock to provide a more user friendly experience for developers using fetch to interact with their APIs. The GraphQL use case is a good example of this - the things which a developer might want to match on are buried in the request body, and written in a non-javascript query language. Please get in touch if you'd like to collaborate on writing such a package.


