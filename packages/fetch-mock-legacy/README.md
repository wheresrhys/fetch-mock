# fetch-mock

Mock http requests made using [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).

Features include:

- mocks most of the fetch API spec, even advanced behaviours such as streaming and aborting
- declarative matching for most aspects of a http request, including url, headers, body and query parameters
- shorthands for the most commonly used features, such as matching a http method or matching one fetch only
- support for delaying responses, or using your own async functions to define custom race conditions
- can be used as a spy to observe real network requests
- can be extended with your own reusable custom matchers that can be used both for matching fetch-calls and inspecting the results
- isomorphic, and supports either a global fetch instance or a locally required instance

_New_ If using jest, try the new [fetch-mock-jest](https://www.npmjs.com/package/fetch-mock-jest) wrapper.

_New_ [Cheatsheet](https://github.com/wheresrhys/fetch-mock/blob/master/docs/cheatsheet.md)

![node version](https://img.shields.io/node/v/fetch-mock.svg?style=flat-square)
[![licence](https://img.shields.io/npm/l/fetch-mock.svg?style=flat-square)](https://github.com/wheresrhys/fetch-mock/blob/master/LICENSE)
![npm downloads](https://img.shields.io/npm/dm/fetch-mock.svg?style=flat-square)
[![CircleCI](https://img.shields.io/circleci/project/github/wheresrhys/fetch-mock.svg?style=flat-square)](https://circleci.com/gh/wheresrhys/workflows/fetch-mock)
[![Code coverage](https://img.shields.io/coveralls/github/wheresrhys/fetch-mock.svg?style=flat-square)](https://coveralls.io/github/wheresrhys/fetch-mock)
[![Known Vulnerabilities](https://snyk.io/test/github/wheresrhys/fetch-mock/badge.svg?targetFile=package.json&style=flat-square)](https://snyk.io/test/github/wheresrhys/fetch-mock?targetFile=package.json)

```js
fetchMock.mock('http://example.com', 200);
const res = await fetch('http://example.com');
assert(res.ok);
fetchMock.restore();
```

## Table of Contents

- [Requirements](#requirements)
- [Documentation and Usage](http://www.wheresrhys.co.uk/fetch-mock/)
- [License](#license)
- [Housekeeping](#housekeeping)

**I devote a lot of time to maintaining fetch-mock for free. I don't ask for payment, but am raising money for a refugee charity - <a href="https://www.justgiving.com/refugee-support-europe">please consider donating</a>**

---

## Requirements

fetch-mock requires the following to run:

- [Node.js](https://nodejs.org/) 8+ for full feature operation
- [Node.js](https://nodejs.org/) 0.12+ with [limitations](http://www.wheresrhys.co.uk/fetch-mock/#usageinstallation)
- [npm](https://www.npmjs.com/package/npm) (normally comes with Node.js)
- Either of the following
  - [node-fetch](https://www.npmjs.com/package/node-fetch) when testing in a nodejs
  - A browser that supports the `fetch` API when testing in a browser

## Documentation and Usage

See the [project website](http://www.wheresrhys.co.uk/fetch-mock/) or [cheatsheet](https://github.com/wheresrhys/fetch-mock/blob/master/docs/cheatsheet.md)

If you're using jest as your test runner, consider using [fetch-mock-jest](https://www.npmjs.com/package/fetch-mock-jest), a lightweight, jest-friendly wrapper around fetch-mock.

## License

fetch-mock is licensed under the [MIT](https://github.com/wheresrhys/fetch-mock/blob/master/LICENSE) license.
Copyright © 2019, Rhys Evans

## Housekeeping

![npm version](https://img.shields.io/npm/v/fetch-mock.svg?style=flat-square)
[![maintainability](https://api.codeclimate.com/v1/badges/7f8abbf54ec9f3d07df3/maintainability?style=flat-square)](https://codeclimate.com/github/wheresrhys/fetch-mock/maintainability)
