---
title: '.sandbox()'
position: 1.0
versionAdded: 5.6.0
description: |-
  Returns a function that can be used as a drop-in replacement for `fetch`. Pass this into your mocking library of choice. The function returned by `sandbox()` has all the methods of `fetch-mock` exposed on it and maintains its own state independent of other instances, so tests can be run in parallel.
left_code_blocks:
  - code_block: |-
      fetchMock
        .sandbox()
        .mock('http://domain.com', 200)
    title: Example
    language: javascript
---
