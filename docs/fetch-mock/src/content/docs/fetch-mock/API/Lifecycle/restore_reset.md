---
title: .restore(), .reset()
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
Resets `fetch()` to its unstubbed state and clears all data recorded for its calls. `restore()` is an alias for `reset()`. Optionally pass in a `{sticky: true}` option to remove even sticky routes.


Both methods are bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.reset)` will work just fine. There is no need for `afterEach(() => fetchMock.reset())`
