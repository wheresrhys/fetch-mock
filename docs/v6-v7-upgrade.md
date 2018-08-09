# Upgrading from V6 to V7

Most changes are relatively minor and shouldn't affect most users.

# Changes

## `throws` option now rejects a Promise
A regression was introduced in v6 whereby the `throws: true` option woudl throw an uncaught error. The `fetch` api catches all its internal errors and returns a rejected `Promise` in every case, so this change has been reverted to be more useful for mocking typical `fetch` errors.

## Responses are wrapped in an ES Proxy
This is to enable a more powerful `flush()` method, able to wait for asynchronous resolution of response methods such as `.json()` and `.text()`. `flush(true)` will resolve only when Promises returnes by any response methods called before `flush()` have resolved

## Supports resolving dots in urls
As resolving `../` and `./` as relative paths is [speced url behaviour](https://url.spec.whatwg.org/#double-dot-path-segment), fetch-mock has been updated to also do this resolution when matching urls. URLs are normalised _before_ any matchers try to match against them as, to the `fetch` api, `http://thing/decoy/../quarry` is indistinguishable from `http://thing/quarry`, so it would make no sense to allow different mocking based on which variant is used.

## Agnostic as to whether hosts have a trailing slash or not
A side-effect of the above normalisation - using [whatwg-url](https://www.npmjs.com/package/whatwg-url) - is that fetch-mock is no longer able to distinguish between pathless URLs which do/do not end in a trailing slash i.e. `http://thing` behaves exactly the same as `http://thing/` when used in any of the library's APIs, and any mocks that match one will match the other. As mentioned above, URL normalization happens _before_ any matching is attempted.

## Request instances are normalized early to [url, options] pairs
The `fetch` api can be called with either a `Request` object or a `url` with an `options` object. To make the library easier to maintain and its APIs - in particular the call inspecting APIs such as `called()` - agnostic as to how `fetch` was called, Request objects are normalised early into `url`, `options` pairs. So the fetch args returned by `calls()` will always be of the form `[url, options]` even if `fetch` was called with a `Request` object. The original `Request` object is still provided as a third item in the args array in case it is needed.

## Adds MATCHED and UNMATCHED constants
The inspection APIs e.g. `calls()` can be passed `true` or `false` to return matched/unmatched calls respectively. To aid with more comprehensible code, fetchMock now exports `MATCHED` and `UNMATCHED` constants, equal to `true` and `false`. Using `true` or `false` still works, but I'd recommend using the constants. Compare the readbility of the following:

```js
const { MATCHED, UNMATCHED } = require('fetch-mock');

fetchMock.called(true);
fetchMock.called(MATCHED);
```

When (some day) fetch-mock migrates to ES6 modules, it'll be even nicer (but won't work yet... though possibly will if using some commonjs to ES6 transpiler)

```js
import default as fetchMock, MATCHED, UNMATCHED from 'fetch-mock';
```
