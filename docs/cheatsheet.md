# fetch-mock cheatsheet

## Installation

- .sandbox()

## Mock setup methods
All these methods can be chained e.g. `fetchMock.getAny(200).catch(400)`
- Stub fetch and **define a route** `.mock(matcher, response)`
- Stub fetch **without a route** `.mock()`
- Spy on calls, letting them **fall through to the network** `.spy()`
- Respond with the given response to any **unmatched calls** `.catch(response)`
- Add a mock that only responds **once** `.once(matcher, response)`
- Add a mock that responds to **any** request `.any(response)`
- Add a mock that responds to **any request, but only once** `.anyOnce(response)`
- Add a mock that only responds to the given **method** `.get()`, `.post()`, `.put()`, `.delete()`, `.head()`, `.patch()`
- **Combinations** of the above behaviours `getAny()`, `getOnce()`, `getAnyOnce()`, `postAny()` ...

## Tear down methods
- Remove all mocks and history `.restore()`, `.reset()`
- Discard all recorded calls, but keep defined routes `.resetHistory()`
- Discard all routes, but keep defined recorded calls`.resetBehavior()`

## Request matching

### Reference request
The following request would be matched by all the mocks described below:
```js
fetch('http://example.com/users/bob?q=rita', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: {
        prop1: 'val1',
        prop2: 'val2'
    }
})
```

### Matching urls
All the below can be passed as the first argument into `.mock()`, (or as the `url` property on the first parameter for combining with other matchers).
- Match **any** url `'*'`
- Match **exact** url `'http://example.com/users/bob?q=rita'` 
- Match **beginning** `'begin:http://example.com'` 
- Match **end** `'end:bob?q=rita'`
- Match **path** `'path:/users/bob'` 
- Match using a **glob** expression `'glob:http://example.{com,gov}/*'` 
- Match using **express** syntax `'express:/users/:name'` 
- Match using a **RegExp** `/\/users\/.*/` 

### Matching other parts of the request
The following should be passed as properties of an object as the first argument of `.mock()`. Multiple rules can be combined together.
- Match the request **method** `{method: 'POST'}`
- Match **headers** `{headers: {'Content-Type': 'application/json'}}`
- Match a **JSON body** `{body: {prop1: 'val1', prop2: 'val2'}}`
- Match **part of a JSON body** `{body: {prop1: 'val1'}, matchPartialBody: true}`
- Match **query** parameters `{query: {q: 'rita'}}`
- Match express **path parameters** `{url: 'express:/users/:name', params: {name: 'bob'}}`

### Custom matching
Match on any condition you like by:
- using a function `{functionMatcher: (url, options, request) => url.length > 100}`
- defining your own declarative matchers with [`addMatcher()`](http://www.wheresrhys.co.uk/fetch-mock/#api-mockingadd-matcher), e.g. something like this would be possible  `{isCorsRequest: true, hasBody: true}`

## Responses
- repeat
- delay
## Inspecting calls
- done
### Naming routes

- Wait for all fetches to respond `.flush()` (pass in `true` to wait for all bodies to be streamed). e.g. `await fetchMock.flush(true)`


