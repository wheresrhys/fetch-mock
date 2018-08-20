- [Introduction](/fetch-mock)
- Quickstart
- [Installation and usage ](/fetch-mock/installation)
- [API documentation](/fetch-mock/api)
- [Troubleshooting](/fetch-mock/troubleshooting)
- [Examples](/fetch-mock/examples)

# Quickstart

## Setting up your mock

The commonest use case is `fetchMock.mock(matcher, response)`, where `matcher` is a string or regex to match and `response` is a statusCode, string or object literal. You can also use `fetchMock.once(url ...)` to limit to a single call or `fetchMock.get()`, `fetchMock.post()` etc. to limit to a method. All these methods are chainable so you can easily define several mocks in a single test.

## Analysing calls to your mock
`fetchMock.called(matcher)` reports if any calls matched your mock (or leave `matcher` out if you just want to check `fetch` was called at all). `fetchMock.lastCall()`, `fetchMock.lastUrl()` or `fetchMock.lastOptions()` give you access to the parameters last passed in to `fetch`. `fetchMock.done()` will tell you if `fetch` was called the expected number of times.

## Tearing down your mock
`fetchMock.reset()` resets the call history. `fetchMock.restore()` will also restore `fetch()` to its native implementation

## Example
Example with node: suppose we have a file `make-request.js` with a function that calls `fetch`:

```js
module.exports = function makeRequest() {
  return fetch("http://httpbin.org/get").then(function(response) {
    return response.json();
  });
};
```

We can use fetch-mock to mock `fetch`. In `mocked.js`:

```js
var fetchMock = require('fetch-mock');
var makeRequest = require('./make-request');

// Mock the fetch() global to always return the same value for GET
// requests to all URLs.
fetchMock.get('*', {hello: 'world'});

makeRequest().then(function(data) {
  console.log('got data', data);
});

// Unmock.
fetchMock.restore();
```

Result:

```bash
$ node mocked.js
'got data' { hello: 'world' } 
```
