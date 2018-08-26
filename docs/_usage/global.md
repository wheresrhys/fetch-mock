---
title: Global fetch
position: 3
content_markdown: |-
  In the following scenarios `fetch` will be a global
  - When using native `fetch` (or a polyfill) in the browser
  - When `node-fetch` has been assigned to `global` in your nodejs process (a pattern sometiems used in isomorphic codebases)

  By default fetch-mock assumes `fetch` is a global so once you've required fetch-mock, refer to the quickstart and api docs.
---
