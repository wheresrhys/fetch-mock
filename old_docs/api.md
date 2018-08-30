
#### `once()`

Shorthand for `mock()` which limits to being called one time only. (see `repeat` option above)

#### `get()`, `post()`, `put()`, `delete()`, `head()`, `patch()`

Shorthands for `mock()` restricted to a particular method _Tip: if you use some other method a lot you can easily define your own shorthands e.g.:_

```
fetchMock.purge = function (matcher, response, options) {
    return this.mock(matcher, response, Object.assign({}, options, {method: 'PURGE'}));
}
```

#### `getOnce()`, `postOnce()`, `putOnce()`, `deleteOnce()`, `headOnce()`, `patchOnce()`

Shorthands for `mock()` restricted to a particular method and that will only respond once

#### `catch(response)`

This is used to define how to respond to calls to fetch that don't match any of the defined mocks. It accepts the same types of response as a normal call to `.mock()`. It can also take an arbitrary function to completely customise behaviour of unmatched calls. It is chainable and can be called before or after other calls to `.mock()`. If `.catch()` is called without any parameters then every unmatched call will receive a `200` response

#### `spy()`

Similar to `catch()`, this records the call history of unmatched calls, but instead of responding with a stubbed response, the request is passed through to native `fetch()` and is allowed to communicate over the network.

To use `.spy()` on a sandboxed `fetchMock`, `fetchMock.config.fetch` must be set to a reference to the `fetch` implementation you use in your code.

```
    fetchMock.sandbox().mock('http://domain.com', 200)
```

Existing sandboxed `fetchMock`s can also have `.sandbox()` called on them, thus building mocks that inherit some settings from a parent mock

#### `sandbox()`

This returns a drop-in mock for fetch which can be passed to other mocking libraries. It implements the full fetch-mock api and maintains its own state independent of other instances, so tests can be run in parallel. e.g.

#### `restore()/reset()`

Chainable method that restores `fetch()` to its unstubbed state and clears all data recorded for its calls.

#### `resetHistory()`

Chainable method that clears all data recorded for `fetch()`'s calls. _It will not restore fetch to its default implementation_

_Note that `restore()`, `reset()` and `resetHistory()` are all bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.reset)` will work just fine. There is no need for `afterEach(function () {fetchMock.reset()})`_

## Inspecting how `fetch()` has been called

### Filtering

Most of the methods below accept two parameters, `(filter, options)`

- `filter` Enables filtering fetch calls for the most commonly use cases. The behaviour can be counterintuitive. The following rules, applied in the order they are described, are used to try to retrieve calls. If any rule retrieves no calls the next rule will be tried.
  - If `options` is defined (it can even be an empty object), `filter` is executed using the same execution plan as matchers used in `.mock()`. Any calls matched by it will be returned. `options` will be used in a similar way to the options used by `mock()`. `options` may be a string specifying a `method` to filter by
  - If `filter` is `undefined` all calls, matched _and_ unmatched, are returned
  - If `filter` is `true` (or `fetchMock.MATCHED`) all calls that matched some route are returned
  - If `filter` is `false` (or `fetchMock.UNMATCHED`) all calls that did not match any route are returned (when `.spy()`, `catch()` or `config.fallThroughToNetwork` were used to prevent errors being thrown)
  - If `filter` is the name of a named route, all calls handled by that route are returned
  - If `filter` is equal to `matcher` or `matcher.toString()` for a route, all calls handled by that route are returned
  - `filter` is executed using the same execution plan as matchers used in `.mock()`. Any calls matched by it will be returned.

#### `called(filter, method)`

Returns a Boolean indicating whether fetch was called and a route was matched. If `filter` is specified it only returns `true` if that particular route was matched.

#### `done(filter, method)`

Returns a Boolean indicating whether fetch was called the expected number of times (or at least once if the route defines no expectation is set for the route). _Unlike the other methods for inspecting calls, unmatched calls are irrelevant_. Therefore, if no `filter` is passed, `done()` returns `true` if every route has been called the number of expected times.

#### `calls(filter, method)`

Returns an array of all calls to fetch matchingthe given filters. Each call is returned as an array of length 2, `[url, options]`. If `fetch` was called using a `Request` instance, thsi will be available as a `request` property on this array.

#### `lastCall(filter, method)`

Returns the arguments for the last matched call to fetch

#### `lastUrl(filter, method)`

Returns the url for the last matched call to fetch. When `fetch` was last called using a `Request` instance, the url will be extracted from this

#### `lastOptions(filter, method)`

Returns the options for the last matched call to fetch. When `fetch` was last called using a `Request` instance, a set of `options` inferred from the `Request` will be returned

#### `flush()`

Returns a `Promise` that resolves once all fetches handled by fetch-mock have resolved. Pass in `true` to wait for all response methods (`res.json()`, `res.text()`, etc.) to resolve too. Useful for testing code that uses `fetch` but doesn't return a promise.
