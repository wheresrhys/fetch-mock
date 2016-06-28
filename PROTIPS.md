# fetch-mock
Adding a `^` to the beginning of a string means a url must _begin_ with the rest of the string. e.g. 
```
fetchMock.mock('^http://example.com', 200);
```
Will match http://example.com, http://example.com/thing.html etc.
- - - 
If mocking lots of routes you can name them
```
fetchMock({
    name: 'example',
    matcher: 'http://example.com.thing.html'
    response: 200
})
```
- - -
Since version 4.5.4 a bug's been fixed, meaning your tests should run in environments where `fetch` doesn't exist as a global in the test environment, though is assumed to in production. There shouldn't be any need to use the deprecated `useNonGlobalFetch()` method ever either
- - -
To delay responses you can wrap the response in a `Promise`
```
fetchMock.mock('^http://example.com', new Promise(res => setTimeout(res, 200)).then(() => 200));
```
- - - 
For test involving complex asynchronous interactions use functions that return Promises
```
fetchMock.mock('^http://example.com', (url, opts) => {
    return opts.headers.Auth ? callApi().then(200) : 403
});
```
- - -
By default any unmatched calls go straight through to `fetch`. Set `fetchMock.greed = 'bad'` to make them all error, or `fetchMock.greed = 'good'` to return `200` responses
- - - 
When using webpack and it's variety of plugins alongside karma, fetch-mock, isomorphic fetch and others sometimes the easiest way to define `fetch` in the environment is to include it as a standalone script (`npm install whatwg-fetch`) and leave it out of your main bundle. Or run your tests in firefox/chrome, where fetch is native
