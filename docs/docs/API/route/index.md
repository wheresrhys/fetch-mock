---
sidebar_position: 2
sidebar_label: .route()
---

# route()

`fetchMock.route(matcher, response, options)`

Adds a route to `fetchHandler`'s router. A route is a combination of

- one or more rules for deciding whether a particular fetch request should be handled by the route
- configuration for generating an appropriate response

It returns the fetchMock instance, so is chainable e.g. `fetchMock.route('a', 200).route('b', 301)`

## Parameters

### matcher

`{String|Regex|Function|Object}`

Determines which calls to `fetch` should be handled by this route. If multiple criteria need to be applied at once, e.g. matching headers and a uirl pattern, then an object containing multiple matchers may be used.

### response

`{String|Object|Function|Promise|Response}`

Response to send when a call is matched

### options

`{Object|String}`

More options to configure matching and response behaviour. Alternatively, when a `String` is provided it will be used as a name for the route (used when inspecting calls or removing routes).

## Alternate call patterns

As well as the function signature described above, the following patterns are supported.

### Name as third parameter

A string can be passed as the third parameter, and will be used as the route name. e.g.
`fetchMock.route('*', 200, 'catch-all')` is equivalent to `fetchMock.route('*', 200, {name: 'catch-all'})`.

### Matchers on third parameter

The matchers specified in the first parameter are merged internally with the options object passed as the third parameter. This means that it does not matter on which of these objects you specify options/matchers.

This can be particularly useful for clearly and concisely expressing similar routes that only differ in e.g. different query strings or headers e.g.

```js
fetchMock
	.route('http://my.site', 401)
	.route('http://my.site', 200, { headers: { auth: true } });
```

### Single options object

Matchers, options and a response can be combined on a single options object passed into the first parameter, e.g.

```js
fetchMock.route({
	url: 'http://my.site',
	repeat: 2
	response: 200
})

```

#### TypeScript: Config Object Overload Workaround

If you encounter a TypeScript error like:

```
Object literal may only specify known properties, and 'url' does not exist in type 'RegExp | URL | URLMatcherObject | RouteMatcherFunction'.
```

You can work around this by wrapping your config object in the provided class:

```typescript
import fetchMock, { RouteConfigWrapper } from 'fetch-mock';

fetchMock.route(
	new RouteConfigWrapper({
		url: 'glob:*/api/v1/monitoring/metricsForRuntimes?*',
		query: {},
		response: Promise.resolve(allMetricsData),
		delay: 2000,
	}),
);
```

## Examples

### Strings

```js
fetchMock
	.route('http://it.at.here/route', 200)
	.route('begin:http://it', 200)
	.route('end:here/route', 200)
	.route('path:/route', 200)
	.route('*', 200);
```

### Complex Matchers

```js
fetchMock
	.route(/.*\.here.*/, 200)
	.route((url, opts) => opts.method === 'patch', 200)
	.route('express:/:type/:id', 200, {
		params: {
			type: 'shoe',
		},
	})
	.route(
		{
			headers: { Authorization: 'Bearer 123' },
			method: 'POST',
		},
		200,
	);
```

### Responses

```js
fetchMock
  .route('*', 'ok')
  .route('*', 404)
  .route('*', {results: []})
  .route('*', {throws: new Error('Bad kitty')})
  .route('*', new Promise(res => setTimeout(res, 1000, 404)))
  .route('*', (url, opts) => {
    status: 302,
    headers: {
      Location: url.replace(/^http/, 'https')
    },
  }))
```

### End to end example

```js
fetchMock.route('begin:http://it.at.here/api', 403).route(
	{
		url: 'begin:http://it.at.here/api',
		headers: {
			authorization: 'Basic dummy-token',
		},
	},
	200,
);

callApi('/endpoint', 'dummy-token').then((res) => {
	expect(res.status).to.equal(200);
});
```
