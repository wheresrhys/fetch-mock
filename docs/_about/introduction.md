---
title:
position: 1
content_markdown: |-
  fetch-mock allows mocking http requests made using [fetch](https://fetch.spec.whatwg.org/) or a library imitating its api, such as [node-fetch](https://www.npmjs.com/package/node-fetch) or [fetch-ponyfill](https://www.npmjs.com/package/fetch-ponyfill).

  It supports most JavaScript environments, including Node.js, web workers, service workers, and any browser that either supports `fetch` natively or that can have a `fetch` polyfill installed.

  As well as shorthand methods for the simplest use cases, it offers a flexible API for customising all aspects of mocking behaviour.

left_code_blocks:
  - code_block: |-
      fetchMock.mock('http://example.com', 200);
      const res = await fetch('http://example.com');
      assert(res.ok);
      fetchMock.restore();
    title: Example
    language: javascript
---
