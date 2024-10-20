---
sidebar_position: 1
---

# Installation

Install fetch-mock using

```bash
npm install --save-dev fetch-mock
```

fetch-mock supports both [ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) and [commonjs](https://requirejs.org/docs/commonjs.html). The following should work in most environments. Check the [importing the correct version](#usageimporting) section of the docs if you experience problems.

## ES modules

```js
import fetchMock from 'fetch-mock';
```

## Commonjs

```js
const fetchMock = require('fetch-mock');
```

## Using alongside other testing frameworks

When using one of the following frameworks consider using the appropriate wrapper library, which modify/extend fetch-mock to make using it more idiomatic to your testing environment e.g. adding methods equivalent to Jest's `mockRestore()` etc.

- Jest - [@fetch-mock/jest](/fetch-mock/docs/wrappers/jest)
- Vitest - [@fetch-mock/vitest](/fetch-mock/docs/wrappers/vitest)
