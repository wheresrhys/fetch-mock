# fetch-mock cheatsheet

_This is a first draft - please feedback in the [issues](https://github.com/wheresrhys/fetch-mock/issues)_

- [Installation](#installation)
- [Set up and teardown](#setup-and-teardown)
- [Request matching](#request-matching)
- [Response configuration](#response-configuration)
- [Inspecting calls](#inspecting-calls)

## Installation

`npm i -D fetch-mock` (or `npm i -D fetch-mock-jest` if using jest)

### Global fetch

import/require the fetch-mock/fetch-mock-jest library. For the vast majority of test toolchains this _should_ just work without any additional wiring.

### Local fetch with jest

```js
jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('node-fetch');
```

### Local fetch with other test runners

```js
// pass this mock into your module mocking tool of choice
// Example uses https://www.npmjs.com/package/proxyquire
const fetchMock = require('fetch-mock').sandbox();
proxyquire('./my-module', { 'node-fetch': fetchMock });
```

## Setup and teardown

### Mock setup methods

All these methods can be chained e.g. `fetchMock.getAny(200).catch(400)`

- Stub fetch and **define a route** `.mock(matcher, response)`
- Stub fetch **without a route** `.mock()`
- Spy on calls, letting them **fall through to the network** `.spy()`
- Let **specific calls fall through to the network** `.spy(matcher)`
- Respond with the given response to any **unmatched calls** `.catch(response)`
- Add a mock that only responds **once** `.once(matcher, response)`
- Add a mock that responds to **any** request `.any(response)`
- Add a mock that responds to **any request, but only once** `.anyOnce(response)`
- Add a mock that only responds to the given **method** `.get()`, `.post()`, `.put()`, `.delete()`, `.head()`, `.patch()`
- **Combinations** of the above behaviours `getAny()`, `getOnce()`, `getAnyOnce()`, `postAny()` ...

### Tear down methods

- Remove all mocks and history `.restore()`, `.reset()`
- Discard all recorded calls, but keep defined routes `.resetHistory()`
- Discard all routes, but keep defined recorded calls`.resetBehavior()`

## Request matching

The following request would be matched by all the mocks described below:

```js
fetch('http://example.com/users/bob?q=rita', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: '{"prop1": "val1", "prop2": "val2"}',
});
```

### Urls

Can be passed as

- the first argument `.mock('blah', 200)`
- a `url` property on the first argument `.mock({url: 'blah'}, 200)`

#### Patterns

- Match **any** url `'*'`
- Match **exact** url `'http://example.com/users/bob?q=rita'`
- Match **beginning** `'begin:http://example.com'`
- Match **end** `'end:bob?q=rita'`
- Match **path** `'path:/users/bob'`
- Match a **glob** expression `'glob:http://example.{com,gov}/*'`
- Match **express** syntax `'express:/users/:name'`
- Match a **RegExp** `/\/users\/.*/`

#### Naming routes

When defining multiple mocks on the same underlying url (e.g. differing only on headers), set a `name` property on the matcher of each route.

### Other properties

The following should be passed as properties of the first argument of `.mock()`.

- Match the request **method** `{method: 'POST'}`
- Match **headers** `{headers: {'Content-Type': 'application/json'}}`
- Match a **JSON body** `{body: {prop1: 'val1', prop2: 'val2'}}`
- Match **part of a JSON body** `{body: {prop1: 'val1'}, matchPartialBody: true}`
- Match **query** parameters `{query: {q: 'rita'}}`
- Match express **path parameters** `{url: 'express:/users/:name', params: {name: 'bob'}}`

### Custom

Match on any condition you like by:

- using a function `{functionMatcher: (url, options, request) => url.length > 100}` (or can just pass the function in as the first parameter, not wrapped in an object)
- defining your own declarative matchers with [`addMatcher()`](http://www.wheresrhys.co.uk/fetch-mock/#api-mockingadd-matcher), e.g. setting up declarative matchers that can be used like this is possible `{isCorsRequest: true, hasBody: true}`

## Response configuration

Responses are configured with the second, and sometimes third, arguments passed to `.mock()` (or the first and second argument of `.any()` or `.catch()`). Where only one code sample is given below, it describes the second argument; otherwise the second and third are given. _[Note - in the next major version these will all be available on the second argument]_

- **`Response`** instance `new Response('hello world')`
- **status code** `200`
- **text** `hello world`
- **JSON** `{prop: 'val'}`
- **streamed content** `new Blob()`, `{sendAsJson: false}`
- **headers** `{body: 'hello world', status: 200, headers: {'Content-Type': 'text'}`
- **throw** an error `{throws: new Error('fetch failed')}`
- **redirect** `{redirectUrl: 'http://other.site, status: 302}`
- **function** `` (url, options, request) => `Content from ${url}` ``

### Timing and repetition

- Respond a specified **number of times** `200`, `{repeat: 3}`
- **Delay** by a number of milliseconds `200`, `{delay: 2000}`
- Custom async behaviour using a **Promise** `myPromise.then(200)`

Functions and Promises can be nested to any depth to implement complex race conditions

## Inspecting calls

`.calls()` retrieves a list of all calls matching certain conditions. It return an array of `[url, options]` arrays, which also have a `.request` property containng the original `Request` instance.

### Filtering

- **all** calls `.calls()`
- **matched** calls `.calls(true)` or `.calls('matched')`
- **unmatched** calls `.calls(false)` or `.calls('unmatched')`
- calls to a **named route** `.calls('My route`)
- calls to a **url pattern** used in a route `.calls('end:/path/bob`)
- calls matching a **matcher** `.calls(anyValidMatcher)`
- calls filtered by **method** `.calls(anyValidMatcher, 'POST')`

### Shortcut methods

These accept the same filters as above, but give a quicker route to answering common questions

- Do **any calls** match the filter? `.called()`
- What was the **last call** `.lastCall()`
- What was the **last url** `.lastUrl()`
- What was the **last options** `.lastOptions()`

### Completion

- Check if **all routes** have been **called as expected** `.done()`
- Check if **all routes matching the filter** have been **called as expected** `.done(filter)` (filter must be a **route name** or **url pattern**)
- Wait for all fetches to respond `.flush()` (pass in `true` to wait for all bodies to be streamed). e.g. `await fetchMock.flush(true)`
