---
sidebar_position: 0.5
---

# Requirements

fetch-mock requires the following to run:

- Either
  - [Node.js](https://Node.js.org/) 18+
  - A modern browser implementing the `fetch` API.
- [npm](https://www.npmjs.com/package/npm) (normally comes with Node.js)

For usage in older versions of Node.js or older browsers consider [/fetch-mock/docs/legacy-api](using an older version of fetch-mock).

If using node-fetch in your application fetch-mock@12 and above may work for you, but the fetch-mock test suite does not run against node-fetch, so it may be safer to use an older version of fetch-mock as these were tested against node-fetch and are less likley to introduce breaking changes
