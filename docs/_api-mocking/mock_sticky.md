---
title: '.sticky()'
position: 3
versionAdded: 9.7.0
description: |-
  Shorthand for `mock()` which creates a route that persists even when `restore()`, `reset()` or `resetbehavior()` are called;
parentMethodGroup: mocking
content_markdown: |-
  This method is particularly useful for setting up fixtures that must remain in place for all tests, e.g.
  ```js
  fetchMock.sticky(/config-hub.com/, require('./fixtures/start-up-config.json'))
  ```
---
