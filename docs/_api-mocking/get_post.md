---
title: ".get(), .post(), .put(), .delete(), .head(), .patch()"
navTitle: .get(), .post() ...
position: 3
description: |-
  Shorthands for `mock()` restricted to a particular method.
parentMethodGroup: mocking
content_markdown: |-
  If you use some other method a lot you can easily define your own shorthands e.g.
  {: .info}

  ```javascript
  fetchMock.purge = function (matcher, response, options) {
      return this.mock(
        matcher,
        response,
        Object.assign({}, options, {method: 'PURGE'})
      );
  }
  ```
---
