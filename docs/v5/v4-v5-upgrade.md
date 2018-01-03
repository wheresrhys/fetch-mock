# Upgrading from v4 to v5

## Handling unmatched calls (`greed`)

In previous versions fetch-mock had a `greed` property, set to
- `good` - unmatched calls respond with a 200
- `bad` - unmatched calls error
- `none` - allow unmatched calls to use native `fetch` and the network

This has now been replaced by a `.catch()` method which accepts the same types of response as a normal call to `.mock(matcher, response)`. It can also take an arbitrary function to completely customise behaviour of unmatched calls. It is chainable and can be called before or after other calls to `.mock()`. The api to check for unmatched calls remains unchanged. e.g.
```javascript
fetchMock.mock({matcher: 'http://it.at.there', response: 404, greed: 'good'});
// changes to
fetchMock.mock('http://it.at.there', 404).catch(200);
```

> Can I still let calls to `fetch` fall through to the network?

**No**. In general it's bad practice to have your tests dependent on the network, and the previous default behaviour didn't do enough to discourage this.
However, if there's demand for the feature to be added in it shouldn't be too difficult. I just didn't want to add the feature unless people are unhappy with the upgrade on offer

## Matching calls on methods
The previous signature of `.mock(matcher, method, response)` has changed to `mock(matcher, response, {method})` - _sorry_ :grimace:, but the previous API overloaded parameters and made it difficult to add new functionality (e.g. it's blocked rolling out a 'mock n times' feature for a while).

But there is some good news, in the form of `get()`, `post()`, `put()`, `delete()`, `head()` shorthands.

e.g.
```javascript
fetchMock.mock('http://it.at.there', 'GET', 200)
// changes to
fetchMock.mock('http://it.at.there', 200, {method: 'GET'})
// or
fetchMock.get('http://it.at.there', 200)
```

## Complex configuration of multiple routes
Previously several routes could be configured at once by passing an array of route configs in to `.mock()`. This is no longer supported as the chainability of `.mock()` means setting up multiple mocks is easy. However, to continue support for arrays of routes, `.mock()`` is bound to `fetchMock`, so the following can be done

```javascript
arrayOfRoutes.map(fetchMock.mock);
```

### Using non-global fetch
It's already extensively documented in the README why it's a bad idea to do so, and the `useNonGlobalFetch` method has finally been removed. Since a [bugfix](https://github.com/wheresrhys/fetch-mock/pull/102) a few months ago it should no longer be necessary even when using a non-global fetch. `getMock()` has also been removed, and now `fetchMock.fetchMock` can be used directly as a mock for `fetch`.

### restoring/resetting before continuing to mock (`reMock()`)
Previously the `reMock()` method provided a shorthand for `restore()` followed by `mock()`. Now both `.reset()` and `.restore()` are chainable, so

```javascript
fetchMock.reMock('http://it.at.there', 404);
//changes to
fetchMock.restore().mock('http://it.at.there', 404);
```

## New features
- use `fetchMock.configure({sendAsJson: false})` to make it easier to work with Buffers
- pass a native `Response` object directly into the second paramter of `.mock()`
- use '*' to match any url
