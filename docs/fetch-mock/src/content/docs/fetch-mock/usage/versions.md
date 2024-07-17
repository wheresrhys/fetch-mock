---
title: Versions
sidebar:
  order: 2
---
Note that the documentation below refers to **version 9** of the library.

Version 10 is a significant rewrite and should just work in any environment where `fetch` is available natively. It's relatively untested, so if it doesn't work for you please raise an issue, then downgrade to version 9 and follow the usage documentation below. 

- [Node.js](https://Node.js.org/) 8+ for full feature operation
- [Node.js](https://Node.js.org/) 0.12+ with [limitations](http://www.wheresrhys.co.uk/fetch-mock/installation)
- [npm](https://www.npmjs.com/package/npm) (normally comes with Node.js)
- Either
  - [node-fetch](https://www.npmjs.com/package/node-fetch) when testing in Node.js. To allow users a choice over which version to use, `node-fetch` is not included as a dependency of `fetch-mock`.
  - A browser that supports the `fetch` API either natively or via a [polyfill/ponyfill](https://ponyfoo.com/articles/polyfills-or-ponyfills)



v7, v8 & v9 are practically identical, only differing in their treatment of a few edge cases, or in compatibility with other libraries and environments. For clarity, each section of the documentation tells you which version a feature was added with a <small class="version-added">version</small> label.

For previous versions follow the documentation below: 

- [v7 upgrade guide](https://github.com/wheresrhys/fetch-mock/blob/master/docs/v6-v7-upgrade-guide.md)
- [v6 docs](https://github.com/wheresrhys/fetch-mock/tree/4231044aa94e234b53e296181ca5b6b4cecb6e3f/docs)
- [v5 docs](https://github.com/wheresrhys/fetch-mock/tree/b8270640d5711feffb01d1bf85bb7da95179c4de/docs)
