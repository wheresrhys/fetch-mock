---
title: Usage with Jest
position: 6
parentItem: installation
content_markdown: |-
  Please try out the new jest-friendly wrapper for fetch-mock, [fetch-mock-jest](https://github.com/wheresrhys/fetch-mock-jest), and [feedback](https://github.com/wheresrhys/fetch-mock-jest/issues)
  {: .info}

  Jest has rapidly become a very popular, full-featured testing library. Usage of fetch-mock with Jest is sufficiently different to previous libraries that it deserves some examples of its own:

  If using global `fetch`, then no special treatment is required.

  For non-global uses of `node-fetch` use something like:

  ```js
  jest.mock('node-fetch', () => require('fetch-mock').sandbox())
  ```

  if you need to fallback to the network (or have some other use case for giving `fetch-mock` [access to `node-fetch` internals](#usagecustom-classes) you will need to use `jest.requireActual('node-fetch')`, e.g.

  ```javascript
  jest.mock('node-fetch', () => {
    const nodeFetch = jest.requireActual('node-fetch');
    const fetchMock = require('fetch-mock').sandbox();
    Object.assign(fetchMock.config, {
      fetch: nodeFetch
    });
    return fetchMock;
  })
  ```

  The content of the above function (exporting `fetchMock`) can also be used in a [manual mock](https://jestjs.io/docs/en/manual-mocks). 

  Once mocked, you should require `node-fetch`, _not_ `fetch-mock`, in your test files - all the `fetch-mock` methods will be available on it.

  When using a webpack based compilation step, something like the following may be necessary instead

  ```javascript
  const fetchMock = require('fetch-mock').sandbox();
  const nodeFetch = require('node-fetch');
  nodeFetch.default = fetchMock;
  ```
---
