# fetch-mock cheatsheet

## Installation

- .sandbox()

## Mock setup methods
- Stub fetch defining a mock routes `.mock(matcher, response)`
- Stub fetch without defining any mock routes `.mock()`
- Let unmatched calls fall through to the network, and record them `.spy()`
- Respond with the given response to any unmatched calls `.catch(response)`
- Add a mock that only responds once `.once(matcher, response)`
- Add a mock that responds to any request `.any(response)`
- Add a mock that responds to any request, but only to that one request `.anyOnce(response)`
- Add a mock that only responds to the given method `.get()`, `.post()`, `.put()`, `.delete()`, `.head()`, `.patch()`
- Combinations of the above behaviours `getAny()`, `getOnce()`, `getAnyOnce()`, `postAny()` ...

## Tear down methods
- Remove all routes & call history from fetch-mock, and also (if relevant)restore global `fetch` to its initial implementation `.restore()`, `.reset()`
- Discard all recorded calls, but keep defined routes `.resetHistory()`
- Discard all routes, but keep defined recorded calls`.resetBehavior()`

## Matching rules

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
- Match any url `'*'`
- Match exact url `'http://example.com/users/bob?q=rita'` 
- Match beginning of url `'begin:http://example.com'` 
- Match end of url `'end:bob?q=rita'`
- Match path of url `'path:/users/bob'` 
- Match url using a glob expression `'glob:http://example.{com,gov}/*'` 
- Match url using express parameter syntax `'express:/users/:name'` 
- Match url using a RegExp `/\/users\/.*/` 

### Matching other parts of the request
The following should be passed as properties of an object as the first argument of `.mock()`. Multiple rules can be combined together.
- Match the method used by the request `{method: 'POST'}`
- Match based on headers sent `{headers: {'Content-Type': 'application/json'}}`
- Match an exact JSON body `{body: {prop1: 'val1', prop2: 'val2'}}`
- Match part of a JSON body `{body: {prop1: 'val1'}, matchPartialBody: true}`
- Match query parameters `{query: {q: 'rita'}}`
- Match express path parameters `{url: 'express:/users/:name', params: {name: 'bob'}}`

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


