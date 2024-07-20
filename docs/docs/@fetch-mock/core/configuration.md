---
sidebar_position: 6
---

# Configuration

On any `fetch-mock` instance, set configuration options directly on the `fetchMock.config` object. e.g.

```js
const fetchMock = require('fetch-mock');
fetchMock.config.sendAsJson = false;
```

## Available options

Options marked with a `†` can also be overridden for individual calls to `.mock(matcher, response, options)` by setting as properties on the `options` parameter

### sendAsJson<sup>†</sup>

`{Boolean}` default: `true`

Always convert objects passed to `.mock()` to JSON strings before building reponses. Can be useful to set to `false` globally if e.g. dealing with a lot of `ArrayBuffer`s. When `true` the `Content-Type: application/json` header will also be set on each response.

### includeContentLength<sup>†</sup>

`{Boolean}` default: `true`

Sets a `Content-Length` header on each response.

### matchPartialBody

`{Boolean}` default: `false`

Match calls that only partially match a specified body json. Uses the [is-subset](https://www.npmjs.com/package/is-subset) library under the hood, which implements behaviour the same as jest's [.objectContaining()](https://jestjs.io/docs/en/expect#expectobjectcontainingobject) method.

### Custom fetch implementations

`fetch`, `Headers`, `Request`, `Response` can all be set on the configuration object, allowing fetch-mock to mock any implementation of `fetch`, e.g. `node-fetch`. e.g.

```js
import { default as fetch, Headers, Request, Response } from 'node-fetch';

import fetchMock from 'fetch-mock';

fetchMock.config = Object.assign(fetchMock.config, {
	Request,
	Response,
	Headers,
	fetch,
});
```
