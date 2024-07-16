---
title: '.sandbox()'
sidebar:
  # Set a custom label for the link
  label: Custom sidebar label
  # Set a custom order for the link (lower numbers are displayed higher up)
  order: 2
  # Add a badge to the link
  badge:
    text: New
    variant: tip
---
Returns a function that can be used as a drop-in replacement for `fetch`. Pass this into your mocking library of choice. The function returned by `sandbox()` has all the methods of `fetch-mock` exposed on it and maintains its own state independent of other instances, so tests can be run in parallel.
left_code_blocks:
  - code_block: |-
      fetchMock
        .sandbox()
        .mock('http://domain.com', 200)
    title: Example
    language: javascript
