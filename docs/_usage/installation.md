---
title: Installation
position: 2
parameters:
  - name:
    content:
content_markdown: |-

  Install fetch-mock using `npm install --save-dev fetch-mock`

  In most environments use one of the following in your test files

  ```js
  const fetchMock = require('fetch-mock');

  // Exposes constants that will make tests more readable
  const { fetchMock, MATCHED, UNMATCHED } = require('fetch-mock');
  ```

  Some exceptions include:

  If your client-side code or tests do not use a loader that respects the `browser` field of `package.json` use `require('fetch-mock/es5/client')`.
  {: .warning}
  If you need to use fetch-mock without commonjs, you can include the precompiled `node_modules/fetch-mock/es5/client-bundle.js` in a script tag. This loads fetch-mock into the `fetchMock` global variable.
  {: .info}
  For server side tests running in nodejs 6 or lower use `require('fetch-mock/es5/server')`
  {: .info}
---

