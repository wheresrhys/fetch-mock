---
title: .resetHistory()
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
Clears all data recorded for `fetch`'s calls. It _will not_ restore fetch to its default implementation

`resetHistory()` is bound to fetchMock, and can be used directly as a callback e.g. `afterEach(fetchMock.resetHistory)` will work just fine. There is no need for `afterEach(() => fetchMock.resetHistory())`
