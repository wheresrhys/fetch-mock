---
title: Installation
position: 2
content_markdown: |-

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
---
