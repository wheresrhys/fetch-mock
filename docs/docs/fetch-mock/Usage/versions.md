---
sidebar_position: 5
---

# Versions

## Version 10/11

These have 2 major differences from previous versions

1. It is written using ES modules
2. It uses native fetch in node.js

Version 11 is identical to version 10, with the exception that it changes the commonjs to use `exports.default = fetchMock` instead of `exports=fetchMock`.

If you experience any compatibility issues upgrading from version 9, please either

- try the approaches iom the troubleshooting section of these docs
- downgrade to v9 again

I intend to keep version 10 and above reasonably clean, with as few workarounds for different toolchains as possible. Hopefully, as other toolchains gradually migrate to ESM and native fetch then fetch-mock will eventually be compatible with their latest versions.

### Differences

#### Not set as a global in the browser

Previously the browser buiodl of fetch-mock set `window.fetchMock`. This is no longer the case. If your testing toolchain requires it's available as a global you may import a `fetch-mock-wrapper.js` file, defined as follows, rather than `fetch-mock` directly:

```js
import fetchMock from 'fetch-mock';
window.fetchMock = fetchMock;
```

## Version 9 and below

v7, v8 & v9 are practically identical, only differing in their treatment of a few edge cases, or in compatibility with other libraries and environments.

For previous versions follow the documentation below:

- [v7 upgrade guide](https://github.com/wheresrhys/fetch-mock/blob/master/docs/v6-v7-upgrade-guide.md)
- [v6 docs](https://github.com/wheresrhys/fetch-mock/tree/4231044aa94e234b53e296181ca5b6b4cecb6e3f/docs)
- [v5 docs](https://github.com/wheresrhys/fetch-mock/tree/b8270640d5711feffb01d1bf85bb7da95179c4de/docs)
