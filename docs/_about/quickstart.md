---
title: Quickstart
position: 2

content_markdown: |-

  #### Setting up your mock

  - The commonest use case is `fetchMock.mock(matcher, response)`, where `matcher` is an exact url or regex to match, and `response` is a status code, string or object literal.
  - You can also use `fetchMock.once()` to limit to a single call or `fetchMock.get()`, `fetchMock.post()` etc. to limit to a method.
  - All these methods are chainable so you can easily define several mocks in a single test.

  ```javascript
  fetchMock
    .get('http://good.com/', 200)
    .post('http://good.com/', 400)
    .get(/bad\.com/, 500)
  ```
  #### Analysing calls to your mock

  - `fetchMock.called(matcher)` reports if any calls matched your mock (or leave `matcher` out if you just want to check `fetch` was called at all).
  - `fetchMock.lastCall()`, `fetchMock.lastUrl()` or `fetchMock.lastOptions()` give you access to the parameters last passed in to `fetch`.
  - `fetchMock.done()` will tell you if `fetch` was called the expected number of times.

  #### Tearing down your mock

  - `fetchMock.resetHistory()` resets the call history.
  - `fetchMock.reset()` or `fetchMock.restore()` will also restore `fetch()` to its native implementation

  #### Example

  Example with Node.js: suppose we have a file `make-request.js` with a function that calls `fetch`:

  ```js
  require('isomorphic-fetch');
  module.exports = function makeRequest() {
    return fetch('http://httpbin.org/my-url', {
      headers: {
        user: 'me'
      }
    }).then(function(response) {
      return response.json();
    });
  };
  ```

  We can use fetch-mock to mock `fetch`. In `mocked.js`:

  ```js
  var makeRequest = require('./make-request');
  var fetchMock = require('fetch-mock');

  // Mock the fetch() global to return a response 
  fetchMock.get('http://httpbin.org/my-url', { hello: 'world' }, {
    delay: 1000, // fake a slow network
    headers: {
      user: 'me' // only match requests with certain headers
    }
  });

  makeRequest().then(function(data) {
    console.log('got data', data);
  });

  // Unmock.
  fetchMock.reset();
  ```

  Result:

  ```bash
  $ node mocked.js
  'got data' { hello: 'world' }
  ```
---
