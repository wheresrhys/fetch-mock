---
title: Requirements
position: 1
content_markdown: |-
  fetch-mock requires the following to run:

  - [Node.js](https://nodejs.org/) 8+ for full feature operation
  - [Node.js](https://nodejs.org/) 0.12+ with [limitations](http://www.wheresrhys.co.uk/fetch-mock/installation)
  - [npm](https://www.npmjs.com/package/npm) (normally comes with Node.js)
  - Either of the following
    - [node-fetch](https://www.npmjs.com/package/node-fetch) when testing in a nodejs
    - A browser that supports the `fetch` API either natively or via a [polyfill/ponyfill](https://ponyfoo.com/articles/polyfills-or-ponyfills)

  Note that **node-fetch** is not included as a dependency of this package. This is to allow users a choice over which version to use; fetch-mock will use whichever version you have installed
  {: .warning}
left_code_blocks:
  - code_block:
    title:
    language:
right_code_blocks:
  - code_block:
    title:
    language:
---
