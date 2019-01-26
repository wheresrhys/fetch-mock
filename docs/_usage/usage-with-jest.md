---
title: Usage with Jest
position: 6
parentItem: installation
content_markdown: |-
  Jest has rapidly become a very popular, full-featured testing library. Usage of fetch-mock with Jest is sufficiently different to previous libraries that it deserve some examples of its own:
  
  If using global `fetch`, then no special treatment is required.
  
  If assigning `node-fetch` to a variable in your source code, the following should provide a good manual mock for `node-fetch`, saved as `./__mocks__/node-fetch.js` in your project.
  
  ```javascript
  const nodeFetch = jest.requireActual('node-fetch');
  const fetchMock = require('fetch-mock').sandbox();
  Object.assign(fetchMock.config, nodeFetch, {
    fetch: nodeFetch
  });
  module.exports = fetchMock;
  ```
  
  Then, in your test files, when you `require('node-fetch')`, it will return the sandboxed `fetch-mock` instance from the manual mock, so you can use all the `fetch-mock` methods directly on it.
  
  When using a webpack based compilation step, something like the following may be necessary instead
  
  ```javascript
  const fetchMock = require('fetch-mock').sandbox();
  const nodeFetch = require('node-fetch');
  nodeFetch.default = fetchMock;
  ```
  
  If your tests include integration tests that need access to the network, set the `fallbackToNetwork: true` config option within the describe block of those tests:
  
  ```javascript
  const fetch = require('node-fetch');
  describe('integration', () => {
    beforeAll(() => fetchMock.config.fallbackToNetwork = true);
    afterAll(() => fetchMock.config.fallbackToNetwork = false);
  });

  ```
---

