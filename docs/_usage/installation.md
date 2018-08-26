---
title: Installation
position: 2
parameters:
  - name:
    content:
content_markdown: |-

  Install fetch-mock using `npm install --save-dev fetch-mock`

  In most environments use one of the following to use it in your code.


  ```js
  const fetchMock = require('fetch-mock');
  ```
  ```js
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


left_code_blocks:
  - code_block: |2-
      const fetchMock = require('fetch-mock');

      // The following is recommended in order to expose constants that
      // will make tests that check for matched or unmatched calls more
      // readable
      const { fetchMock, MATCHED, UNMATCHED } = require('fetch-mock');
    title: Installation
    language: javascript
right_code_blocks:
  - code_block: |2-
    title: JQuery
    language: javascript
  - code_block: |2-
       curl http://api.myapp.com/books?token=YOUR_APP_KEY
    title: Curl
    language: ba
---

