---
title: ".sandbox()"
position: 1.0
description: |-
  Returns a drop-in mock for fetch which can be passed to other mocking libraries. It implements the full fetch-mock api and maintains its own state independent of other instances, so tests can be run in parallel.
left_code_blocks:
  - code_block: |-
      fetchMock
        .sandbox()
        .mock('http://domain.com', 200)
    title: Example
    language: javascript

---
