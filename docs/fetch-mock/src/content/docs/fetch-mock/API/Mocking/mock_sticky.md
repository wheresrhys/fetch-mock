---
title: '.sticky()'
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
Shorthand for `mock()` which creates a route that persists even when `restore()`, `reset()` or `resetbehavior()` are called;

This method is particularly useful for setting up fixtures that must remain in place for all tests, e.g.
```js
fetchMock.sticky(/config-hub.com/, require('./fixtures/start-up-config.json'))
```
