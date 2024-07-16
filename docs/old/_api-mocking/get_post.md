---
title: '.get(), .post(), .put(), .delete(), .head(), .patch()'
navTitle: .get(), .post() ...
position: 2
versionAdded: 5.0.0
description: |-
  Shorthands for `mock()` that create routes that only respond to requests using a particular http method.
parentMethodGroup: mocking
content_markdown: |-
  If you use some other method a lot you can easily define your own shorthands e.g.

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
