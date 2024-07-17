---
title: .lastUrl(filter, options)
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

Returns the url for the last call to `fetch` matching the given `filter` and `options`. If `fetch` was last called using a `Request` instance, the url will be inferred from this
