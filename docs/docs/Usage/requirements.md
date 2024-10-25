---
sidebar_position: 0.5
---

# Requirements

fetch-mock requires the following to run:

- Either
  - [Node.js](https://Node.js.org/) 18+
  - A modern browser implementing the `fetch` API.
- [npm](https://www.npmjs.com/package/npm) (normally comes with Node.js)

For usage in older versions of Node.js or older browsers consider [using an older version of fetch-mock](/fetch-mock/docs/legacy-api).

If using node-fetch in your application fetch-mock@12 and above may work for you, but the fetch-mock test suite does not run against node-fetch, so it may be safer to use an [older version of fetch-mock](http://localhost:3000/fetch-mock/docs/legacy-api/) that is tested against node-fetch and is less likely to introduce breaking changes.

## Usage with react-native

As react-native ships with a non-spec-compliant version of the URL and URLSearchParams classes, fetch-mock will not run in a react-native environment unless you also include [react-native-url-polyfill](https://www.npmjs.com/package/react-native-url-polyfill). You can either:

1. Include it in your application code. This will add approx 11kb of gzipped code to your bundle.
2. Include it in your test files only. If doing this, its recommended that you have some integration tests that _don't_ use fetch-mock in order to avoid inserting behaviour into your application that relies on the polyfill.
