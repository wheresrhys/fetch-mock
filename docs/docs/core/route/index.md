---
sidebar_position: 2
sidebar_label: .route()
---
# route()

`fetchMock.route(matcher, response, optionsOrName)`

Adds a route to  `fetchHandler`'s router. A route is a combination of 

- one or more rules for deciding whether a particular fetch request should be handled by the route
- configuration for generating an appropriate response

## Parameters

### matcher

`{String|Regex|Function|Object}`

Determines which calls to `fetch` should be handled by this route. If multiple criteria need to be applied at once, e.g. matching headers and a uirl pattern, then an object containing multiple matchers may be used.

### response

`{String|Object|Function|Promise|Response}`

Response to send when a call is matched

### optionsOrName

`{Object|String}`

More options to configure matching and response behaviour. Alternatively, when a `String` is provided it will be used as a name for the route (used when inspecting calls or removing routes)

## Calling with a single options object

`fetchMock.route(options)` is also supported, where `options` is an object that contains a `{response}` property and any number of matchers and other options.

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
  .route('*', {throw: new Error('Bad kitty')))
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
