---
title: Usage with Jest
position: 6
parentItem: installation
content_markdown: |-
  Jest has rapidly become a very popular, full-featured testing library. Usage of fetch-mock with Jest is sufficiently different to previous libraries that it deserves an example of its own:

  ```javascript
  const fetchMock = require('fetch-mock').sandbox();
  const nodeFetch = require('node-fetch');
  nodeFetch.default = fetchMock;
  ```
---

