# Upgrading from V6 to V7 or v8

# Changes

## New documentation site

Please give me your feedback as github issues/pull requests. It feels like a big improvement to me. Hopefully fetch-mock users think the same. http://www.wheresrhys.co.uk/fetch-mock/

## Teardown methods names have changed

To keep the library in line with `sinon`, the most popular mocking libarry in the js ecosystem, a few method names & behaviours have been changed

- `reset()` now resets both call history _and_ the mocking behaviour of fetch-mock - It's a complete teardown of the mocks that have been set up. `restore()` has been kept as an alias for this method
- `resetHistory()` now removes call history. Any previous uses of `reset()` should be replaced with `resetHistory()`
- `resetBehavior()` is a new method which removes mocking behaviour without resetting call history

## `throws` option now rejects a Promise

A regression was introduced in v6 whereby the `throws` option would throw an uncaught error. The `fetch` api catches all its internal errors and returns a rejected `Promise` in every case, so this change has been reverted to be more useful for mocking typical `fetch` errors.

## sendAsJson and includeContentLength options have moved

These shoudl no longer be set on the second - `response` - argument of `.mock()`, but on the third - `options` - argument

## Responses are wrapped in an ES Proxy

This is to enable a more powerful `flush()` method, able to wait for asynchronous resolution of response methods such as `.json()` and `.text()`. `flush(true)` will resolve only when Promises returnes by any response methods called before `flush()` have resolved

## Supports resolving dots in urls

As resolving `../` and `./` as relative paths is [speced url behaviour](https://url.spec.whatwg.org/#double-dot-path-segment), fetch-mock has been updated to also do this resolution when matching urls. URLs are normalised _before_ any matchers try to match against them as, to the `fetch` api, `http://thing/decoy/../quarry` is indistinguishable from `http://thing/quarry`, so it would make no sense to allow different mocking based on which variant is used.

## Agnostic as to whether hosts have a trailing slash or not

A side-effect of the above normalisation - using [whatwg-url](https://www.npmjs.com/package/whatwg-url) - is that fetch-mock is no longer able to distinguish between pathless URLs which do/do not end in a trailing slash i.e. `http://thing` behaves exactly the same as `http://thing/` when used in any of the library's APIs, and any mocks that match one will match the other. As mentioned above, URL normalization happens _before_ any matching is attempted.

## Request instances are normalized early to [url, options] pairs

The `fetch` api can be called with either a `Request` object or a `url` with an `options` object. To make the library easier to maintain and its APIs - in particular the call inspecting APIs such as `called()` - agnostic as to how `fetch` was called, Request objects are normalised early into `url`, `options` pairs. So the fetch args returned by `calls()` will always be of the form `[url, options]` even if `fetch` was called with a `Request` object. The original `Request` object is still provided as a `request` property on the `[url, opts]` array in case it is needed.

## Exporting as property

`fetch-mock` now has a property `fetchMock`, which means the libarry can be imported using any of the below

```js
const fetchMock = require('fetch-mock');
const fetchMock = require('fetch-mock').fetchMock;
const { fetchMock } = require('fetch-mock');
```

The reason for this should become clear in the next point

## Adds MATCHED and UNMATCHED constants

The inspection APIs e.g. `calls()` can be passed `true` or `false` to return matched/unmatched calls respectively. To aid with more comprehensible code, fetchMock now exports `MATCHED` and `UNMATCHED` constants, equal to `true` and `false`. Using `true` or `false` still works, but I'd recommend using the constants. Compare the readbility of the following:

```js
const { fetchMock, MATCHED, UNMATCHED } = require('fetch-mock');

fetchMock.called(true);
fetchMock.called(MATCHED);
```

## Able to match requests based on the path of the url

`fetchMock.mock('path:/apples/pears')` Will match any url whose `path` part is `/apples/pears`

## done(filter) no longer filterable by method

This added a lot of complexity to the source code. Users who were using this feature are encouraged to give names to routes handling different methods and filter using those names

e.g. before

```javascript
fetchMock.getOnce('http://route/form', 200).postOnce('http://route/form', 201);

fetchMock.done('http://route/form', 'post');
```

after

```javascript
fetchMock
	.getOnce('http://route/form', 200, { name: 'get-form' })
	.postOnce('http://route/form', 201, { name: 'post-form' });

fetchMock.done('post-form');
```

## More powerful inspection filtering

Previously, any filter passed in to `calls(filter)` etc... would always be converted to a string and then be used to lookup whether any fetch calls had been handled by a route matcher that also had the same `toString()` value. This is still the case, but if no calls match, then the filter will be converted into an on the fly route matcher, which is then used to filter the list of calls that were handled by fetch. This means e.g. you can use any regex or glob to filter the calls.

Read more in the [filtering docs](http://www.wheresrhys.co.uk/fetch-mock/#api-inspectionfiltering)

### Example

```js
fetchMock.mock('*', 200);
await fetch('/main-course/lasagne', {
	method: 'POST',
	headers: { discount: true },
});
await fetch('/main-course/bolognaise');

fetchMock.called(/l.+gne/); // true
fetchMock.called('glob:/*/lasagne', { method: 'post' }); // true
fetchMock.called((url, options) => options.headers.discount); // true
```
