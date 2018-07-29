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
